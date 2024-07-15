interface Config {
    [key: string]: any;
}

const handleConfigChange = (
    config: Config,
    updateConfig: (key: string, value: any) => void,
    key: string,
    value: any,
    minValue?: number
) => {
    if (minValue !== undefined && typeof value === "number" && value < minValue) {
        return;
    }
    updateConfig(key, value);
};

export default handleConfigChange;
