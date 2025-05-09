module.exports = function(api) {
    api.cache(true);

    return {
        presets: [
            ["babel-preset-expo", {
                "runtime": "classic",
                "jsxRuntime": "classic",
                "unstable_transformImportMeta": true
            }], 
            "nativewind/babel",
            "@babel/preset-react"
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
            ["@babel/plugin-transform-runtime", {
                "regenerator": true,
                "helpers": true,
                "useESModules": false
            }],
            "react-native-reanimated/plugin"
        ]
    };
};