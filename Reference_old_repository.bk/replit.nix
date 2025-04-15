
{ pkgs }: {
  deps = [
    pkgs.killall
    pkgs.imagemagick_light
    pkgs.ollama
    pkgs.python312Packages.pytest_7
    pkgs.p7zip
    pkgs.wget
    pkgs.libxcrypt
  ];
}
