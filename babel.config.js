module.exports = function(api) {
    api.cache(true);

    return {
        presets: [["babel-preset-expo", {
            jsxImportSource: "nativewind"
        }], "nativewind/babel"],

        plugins: [["module-resolver", {
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
        }]]
    };
};