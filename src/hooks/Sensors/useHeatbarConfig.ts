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
};

const initialHeatbarConfig: HeatbarConfig = {
    heatbar_color_one: "#00FF00",
    heatbar_color_two: "#33FF00",
    heatbar_color_three: "#66FF00",
    heatbar_color_four: "#99FF00",
    heatbar_color_five: "#CCFF00",
    heatbar_color_six: "#FFFF00",
    heatbar_color_seven: "#FFCC00",
    heatbar_color_eight: "#FF9900",
    heatbar_color_nine: "#FF6600",
    heatbar_color_ten: "#FF0000",
};

const useHeatbarConfig = () => {

    return useFetchAndSetConfig(initialHeatbarConfig, "get_configs", "set_heatbar_configs");
};

export default useHeatbarConfig;
