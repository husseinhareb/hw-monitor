//Heatbar.tsx
import React from 'react';
import styled from 'styled-components';
import useHeatbarConfig from '../../hooks/Sensors/useHeatbarConfig';

// Style for the heat bar container
const BarContainer = styled.div`
    width: 100px;
    height: 15px;
    background-color: #eee;
    position: relative;
    display: flex;
    margin-left: 10px;
`;

// Style for the heat bar fill section
const BarFillSection = styled.div<{ width: number; color: string }>`
    width: ${props => props.width}%;
    height: 100%;
    background-color: ${props => props.color};
`;

interface HeatBarProps {
    value: number;
    critical: number;
}

const HeatBar: React.FC<HeatBarProps> = ({ value, critical }) => {
    // Calculate the width of the fill based on the value and critical value
    const width = Math.min((value / critical) * 100, 100);
    const heatbarConfig = useHeatbarConfig();
    const sections = [
        { limit: 10, color: heatbarConfig.config.heatbar_color_one }, // Bright Green
        { limit: 20, color: heatbarConfig.config.heatbar_color_two },
        { limit: 30, color: heatbarConfig.config.heatbar_color_three },
        { limit: 40, color: heatbarConfig.config.heatbar_color_four },
        { limit: 50, color: heatbarConfig.config.heatbar_color_five },
        { limit: 60, color: heatbarConfig.config.heatbar_color_six }, // Yellow
        { limit: 70, color: heatbarConfig.config.heatbar_color_seven },
        { limit: 80, color: heatbarConfig.config.heatbar_color_eight },
        { limit: 90, color:heatbarConfig.config.heatbar_color_nine },
        { limit: 100, color: heatbarConfig.config.heatbar_color_ten }, // Red
    ];

    const filledSections = sections.map((section, index) => {
        const sectionWidth = Math.min(width, section.limit) - (index > 0 ? sections[index - 1].limit : 0);
        return sectionWidth > 0 ? (
            <BarFillSection key={index} width={sectionWidth} color={section.color} />
        ) : null;
    });

    return (
        <BarContainer>
            {filledSections}
        </BarContainer>
    );
};

export default HeatBar;
