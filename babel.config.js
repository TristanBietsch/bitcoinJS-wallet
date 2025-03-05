module.exports = function(api) {
    api.cache(true);

    return {
        presets: [
            "babel-preset-expo",
            "@babel/preset-env",
            "@babel/preset-react",
            "@babel/preset-typescript"
        ],

        plugins: [
            ["module-resolver", {
                root: ["./"],

                alias: {
                    "@": "./",
                    "@components": "./components",
                    "@screens": "./screens",
                    "@navigation": "./navigation",
                    "@services": "./services",
                    "@hooks": "./hooks",
                    "@state": "./state",
                    "@utils": "./utils",
                    "@config": "./config",
                    "@assets": "./assets",
                    "@types": "./types",
                    "tailwind.config": "./tailwind.config.js"
                }
            }],
            ["@babel/plugin-transform-class-properties", { "loose": true }],
            ["@babel/plugin-transform-private-methods", { "loose": true }],
            ["@babel/plugin-transform-private-property-in-object", { "loose": true }]
        ]
    };
};