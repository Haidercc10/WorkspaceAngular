module.exports = {
  packagerConfig: {
    asar: true,
    icon: '/assets/Plascaribe_Icono.ico',
    extraResource: ['node_modules/pdf-to-printer/dist/SumatraPDF-3.4.6-32.exe'],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        certificateFile: './cert.pfx',
        certificatePassword: process.env.CERTIFICATE_PASSWORD
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'win32', 'win64', 'linux'],
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
