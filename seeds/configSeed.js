import Config from "../models/Config.js";

const DEFAULT_CONFIGURATIONS = [
  {
    key: "ITBIS",
    value: "18",
  },
];

const seedDefaultConfigurations = async () => {
  for (const configuration of DEFAULT_CONFIGURATIONS) {
    const existingConfiguration = await Config.findOne({
      key: configuration.key,
    });

    if (existingConfiguration) {
      if (!existingConfiguration.key) {
        existingConfiguration.key = configuration.key;
      }

      if (!existingConfiguration.value) {
        existingConfiguration.value = configuration.value;
      }

      await existingConfiguration.save();
      continue;
    }

    await Config.create({
      key: configuration.key,
      value: configuration.value,
    });
  }
};

export default seedDefaultConfigurations;
