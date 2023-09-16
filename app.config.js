module.exports = {
    expo: {
        scheme: "acme",
        web: {
          bundler: "metro"
        },
        plugins: [
          "expo-router",
          [
            "expo-location",
            {
              locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
            }
          ]
        ],
        name: "Hitchhikr",
        slug: "Hitchhikr"
      },
    ios: {
        config: {
          googleMapsApiKey: process.env.GOOGLE_MAPS_API
        }
    }
};