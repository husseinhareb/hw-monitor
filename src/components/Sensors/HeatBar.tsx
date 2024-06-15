import React from 'react';
import styled from 'styled-components';

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

    const sections = [
        { limit: 10, color: '#00FF00' }, // Bright Green
        { limit: 20, color: '#33FF00' },
        { limit: 30, color: '#66FF00' },
        { limit: 40, color: '#99FF00' },
        { limit: 50, color: '#CCFF00' },
        { limit: 60, color: '#FFFF00' }, // Yellow
        { limit: 70, color: '#FFCC00' },
        { limit: 80, color: '#FF9900' },
        { limit: 90, color: '#FF6600' },
        { limit: 100, color: '#FF0000' }, // Red
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
