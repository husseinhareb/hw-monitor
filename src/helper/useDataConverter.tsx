
const useDataConverter = () => {
    const kiloBytes = 1000;

    const convertdata = (data: number | null): { value: number, unit: string } => {
        let unit = "B";
        let convertedData = data || 0;

        if (data !== null) {
            if (data >= kiloBytes * kiloBytes * kiloBytes) {
                convertedData = parseFloat((data / (kiloBytes * kiloBytes * kiloBytes)).toFixed(2));
                unit = "GB";
            } else if (data >= kiloBytes * kiloBytes) {
                convertedData = parseFloat((data / (kiloBytes * kiloBytes)).toFixed(2));
                unit = "MB";
            } else if (data >= kiloBytes) {
                convertedData = parseFloat((data / kiloBytes).toFixed(2));
                unit = "KB";
            }
        }

        return { value: convertedData, unit };
    };

    return convertdata;
};

export default useDataConverter;
