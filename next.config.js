module.exports = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: "yaml-loader",
    });

    return config;
  },
};
