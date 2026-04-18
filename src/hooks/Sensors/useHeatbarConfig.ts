import useFetchAndSetConfig from "../../utils/useConfigUtils";

type HeatbarConfig = {
    heatbar_color_one: string;
    heatbar_color_two: string;
    heatbar_color_three: string;
    heatbar_color_four: string;
    heatbar_color_five: string;
    heatbar_color_six: string;
    heatbar_color_seven: string;
    heatbar_color_eight: string;
    heatbar_color_nine: string;
    heatbar_color_ten: string;
    heatbar_background_color: string;
};

const heatbarConfigKeys = [
    "heatbar_color_one",
    "heatbar_color_two",
    "heatbar_color_three",
    "heatbar_color_four",
    "heatbar_color_five",
    "heatbar_color_six",
    "heatbar_color_seven",
    "heatbar_color_eight",
    "heatbar_color_nine",
    "heatbar_color_ten",
    "heatbar_background_color",
] as const;

const useHeatbarConfig = () => {
    return useFetchAndSetConfig<HeatbarConfig>(heatbarConfigKeys, "set_heatbar_configs");
};

export default useHeatbarConfig;
