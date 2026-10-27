{
  description = "tunnelmole-service development environment (Node.js 24.22.1)";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      # Node version used to develop and test tunnelmole-service.
      #
      # 24.22.1 is a security release, and earlier 24.x releases do not contain
      # its fixes, so do not downgrade this. Nixpkgs is still on 24.21.0, so the
      # official upstream release tarball is used instead of pkgs.nodejs_24,
      # which would either be the wrong version or a from-source rebuild.
      nodeVersion = "24.22.1";

      # Official nodejs.org release tarballs, keyed by Nix system. Only Linux is
      # supported: the tarballs are prebuilt against glibc and are repointed at
      # the Nix store equivalents in postFixup below. Hashes come from the
      # release's SHASUMS256.txt.
      nodejsReleases = {
        x86_64-linux = {
          tarball = "linux-x64";
          hash = "sha256-bBcqmrZxj3uAH7WnvUhq8u5eMnWAhqBLhPzOKqdwleY=";
        };
        aarch64-linux = {
          tarball = "linux-arm64";
          hash = "sha256-26v3ocv5R+YFn/rSwnuABB25feoeVTtir97n8T/KM24=";
        };
      };

      systems = builtins.attrNames nodejsReleases;

      forAllSystems =
        f:
        nixpkgs.lib.genAttrs systems (
          system:
          f {
            inherit system;
            pkgs = nixpkgs.legacyPackages.${system};
          }
        );

      # patchelf 0.19 (what nixpkgs currently ships, and therefore what
      # autoPatchelfHook uses) rewrites the program headers of Node's ~127MB
      # binary so badly that it segfaults before printing anything, so the
      # binary is patched with 0.15.2 instead. Remove this once a patchelf
      # version handles this binary again.
      patchelf_0_15 =
        pkgs:
        pkgs.patchelf.overrideAttrs (old: {
          version = "0.15.2";
          src = pkgs.fetchurl {
            url = "https://github.com/NixOS/patchelf/releases/download/0.15.2/patchelf-0.15.2.tar.bz2";
            hash = "sha256-F3RfVkFZyOIo/EEtplogSLhGxLa0Igt3y/IkFuAvLXw=";
          };
        });

      mkNodejs =
        pkgs: release:
        pkgs.stdenv.mkDerivation {
          pname = "nodejs";
          version = nodeVersion;

          src = pkgs.fetchurl {
            url = "https://nodejs.org/dist/v${nodeVersion}/node-v${nodeVersion}-${release.tarball}.tar.xz";
            hash = release.hash;
          };

          nativeBuildInputs = [ (patchelf_0_15 pkgs) ];

          dontConfigure = true;
          dontBuild = true;
          # Upstream ships already-stripped binaries.
          dontStrip = true;

          installPhase = ''
            runHook preInstall
            mkdir -p "$out"
            cp -r bin include lib share "$out"/
            runHook postInstall
          '';

          postFixup = ''
            # bin/node is the only ELF file in the release. It is linked against
            # the system glibc, libstdc++ and libgcc_s, so point it at their Nix
            # store equivalents. autoPatchelfHook is not used because of the
            # patchelf issue described above.
            patchelf \
              --set-interpreter ${pkgs.stdenv.cc.bintools.dynamicLinker} \
              --set-rpath ${pkgs.lib.makeLibraryPath [
              pkgs.stdenv.cc.cc.lib
              pkgs.stdenv.cc.cc.libgcc
            ]} \
              "$out/bin/node"

            # bin/npm, bin/npx and bin/corepack are symlinks to scripts
            # starting with "#!/usr/bin/env node", which does not exist on
            # NixOS, so rewrite the shebang of the file each symlink points at.
            for prog in npm npx corepack; do
              if [ -L "$out/bin/$prog" ] || [ -f "$out/bin/$prog" ]; then
                script="$(readlink -f "$out/bin/$prog")"
                sed -i '1 s|^#!.*|#!${placeholder "out"}/bin/node|' "$script"
              fi
            done
          '';

          meta = {
            description = "Event-driven I/O framework for the V8 JavaScript engine";
            homepage = "https://nodejs.org";
            license = pkgs.lib.licenses.mit;
            mainProgram = "node";
            platforms = systems;
          };
        };

      mkDevShell = pkgs: nodejs: pkgs.mkShell {
        packages = [
          nodejs
          pkgs.zsh
        ];

        shellHook = ''
          # `nix develop` gives you an interactive bash, so drop into zsh
          # instead. Only for interactive shells, so that things like
          # `nix develop --command npm test` still run their command, and not
          # when direnv loaded the environment (direnv already runs inside the
          # shell you are using).
          if [[ $- == *i* ]] && [ -z "''${DIRENV_DIR:-}" ] && [ -z "''${TM_DEV_SHELL:-}" ]; then
            export TM_DEV_SHELL=1
            exec ${pkgs.zsh}/bin/zsh
          fi

          echo "tunnelmole-service dev shell: node $(node --version), npm $(npm --version)"
        '';
      };
    in
    {
      packages = forAllSystems (
        { system, pkgs }:
        {
          nodejs = mkNodejs pkgs nodejsReleases.${system};
          default = self.packages.${system}.nodejs;
        }
      );

      devShells = forAllSystems (
        { system, pkgs }:
        {
          default = mkDevShell pkgs self.packages.${system}.nodejs;
        }
      );
    };
}
