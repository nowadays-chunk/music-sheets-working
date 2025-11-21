import guitar from '../../../config/guitar';
import React, { useState, useEffect } from 'react';

const CircleOfFifths = ({
    tone,
    quality,
    onElementChange
}) => {
    const [selectedTone, setSelectedTone] = useState(null);
    const [selectedQuality, setSelectedQuality] = useState(null);

    useEffect(() => {
        setSelectedTone(tone);
        setSelectedQuality(quality);
    }, [tone, quality]);

    const majorRadius = 150; // Radius of the circle for major tones
    const minorRadius = 110; // Radius for the inner circle of minor tones
    const majorTones = guitar.circleOfFifths.map((key) => key.key);
    const minorTones = guitar.circleOfFifths.map((key) => key.relative);

    const calculatePosition = (angleDegrees, radius) => {
        const radians = ((angleDegrees - 90) * Math.PI) / 180; // Adjusting the starting angle by -90 degrees to move 'C' to the top
        return {
            x: radius * Math.cos(radians),
            y: radius * Math.sin(radians)
        };
    };

    const selectKey = (tone, quality) => {
        setSelectedTone(tone);
        setSelectedQuality(quality);
    };

    let rotationAngle = 0;
    let selectedMajorTone = selectedTone;
    let selectedMinorTone = selectedTone;

    if (selectedQuality === "Major" || selectedQuality === "Dominant") {
        const majorIndex = majorTones.indexOf(selectedTone);
        if (majorIndex !== -1) {
            rotationAngle = -30 * majorIndex;
            selectedMinorTone = guitar.circleOfFifths[majorIndex].relative;
        }
    } else if (selectedQuality === "Minor") {
        const minorIndex = minorTones.indexOf(selectedTone + 'm');
        if (minorIndex !== -1) {
            rotationAngle = -30 * minorIndex;
            selectedMajorTone = guitar.circleOfFifths.find(key => key.relative === selectedTone)?.key;
        }
    }

    const shouldBeHighlighted = (index, isMajor) => {
        const majorIndex = majorTones.indexOf(selectedMajorTone);
        const minorIndex = minorTones.indexOf(selectedMinorTone + 'm');
    
        // Highlight logic for Major tones
        if (isMajor) {
            if (majorIndex === -1) return false;
            const highlightedIndices = [];
            for (let i = -1; i <= 5; i++) {
                highlightedIndices.push((majorIndex + i + majorTones.length) % majorTones.length);
            }
            return highlightedIndices.includes(index);
        }
    
        // Highlight logic for Minor tones
        if (!isMajor) {
            if (minorIndex === -1) return false;
            const highlightedIndices = [];
            for (let i = -1; i <= 5; i++) {
                highlightedIndices.push((minorIndex + i + minorTones.length) % minorTones.length);
            }
            return highlightedIndices.includes(index);
        }
    
        return false;
    };
    

    return (
        <div className="circle-container">
            <svg viewBox="-200 -200 400 400" xmlns="http://www.w3.org/2000/svg">
                <g className="circleOfFifthsTransition" transform={`rotate(${rotationAngle}, 0, 0)`}>
                    <circle cx="0" cy="0" r={majorRadius} fill="none" stroke="black" />
                    <circle cx="0" cy="0" r={minorRadius} fill="none" stroke="black" />
                    {majorTones.map((tone, index) => {
                        const position = calculatePosition(index * 30, majorRadius);
                        const counterRotationAngle = -rotationAngle;
                        const isHighlighted = shouldBeHighlighted(index, true);

                        return (
                            <g
                                key={tone}
                                transform={`translate(${position.x}, ${position.y})`}
                                className="hover-group"
                                onClick={() => selectKey(tone, "Major")}
                            >
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="20"
                                    fill={isHighlighted ? "#D04848" : "white"}
                                    stroke="black"
                                    className="circle-hover"
                                />
                                <text
                                    x="0"
                                    y="0"
                                    fontSize="12"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    transform={`rotate(${counterRotationAngle})`}
                                >
                                    {tone}
                                </text>
                            </g>
                        );
                    })}
                    {minorTones.map((tone, index) => {
                        const position = calculatePosition(index * 30, minorRadius);
                        const counterRotationAngle = -rotationAngle;
                        const isHighlighted = shouldBeHighlighted(index, false);

                        return (
                            <g
                                key={`minor-${tone}-${index}`}
                                transform={`translate(${position.x}, ${position.y})`}
                                className="hover-group"
                                onClick={() => selectKey(tone.replace('m', ''), "Minor")}
                            >
                                <circle
                                    cx="0"
                                    cy="0"
                                    r="15"
                                    fill={isHighlighted ? "#1E90FF" : "white"}
                                    stroke="black"
                                    className="circle-hover"
                                />
                                <text
                                    x="0"
                                    y="0"
                                    fontSize="10"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    transform={`rotate(${counterRotationAngle})`}
                                    fill="black"
                                >
                                    {tone}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
};

export default CircleOfFifths;
