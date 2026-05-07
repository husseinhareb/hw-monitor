import useFetchAndSetConfig from "../../utils/useConfigUtils";
import type { ConfigData } from "../../bindings";

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

type HeatbarConfig = Pick<ConfigData, (typeof heatbarConfigKeys)[number]>;

const useHeatbarConfig = () => {
    return useFetchAndSetConfig<HeatbarConfig>(heatbarConfigKeys, "set_heatbar_configs");
};

export default useHeatbarConfig;
