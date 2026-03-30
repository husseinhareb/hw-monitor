import styled from "styled-components";

export const Wrapper = styled.div<{ bgColor: string }>`
  background-color: ${(props) => props.bgColor};
  height: 100%;
  width: 100%;
  overflow:auto;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const Select = styled.select<{ inputBgColor: string; borderColor: string; textColor: string }>`
  margin-top:10px;
  flex: 1;
  width: auto;
  height: 34px;
  border: 1px solid ${(props) => props.borderColor};
  border-radius: 5px;
  background: ${(props) => props.inputBgColor};
  color: ${(props) => props.textColor};
  margin-left: 10px;
  margin-right: 15px;
`;

export const Container = styled.div<{ bgColor: string }>`
  background-color: ${(props) => props.bgColor};
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  column-gap: 30px;
  row-gap: 0px;
`;

export const StyledButton = styled.button<{ buttonBgColor: string; buttonTextColor: string }>`
  background-color: ${(props) => props.buttonBgColor};
  color: ${(props) => props.buttonTextColor};
  border-radius: 5px;
  border: none;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  margin-left: 15px;
  margin-top: 10px;
  padding: 10px 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    filter: brightness(0.92);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  &:active {
    filter: brightness(0.85);
  }

  svg {
    margin-right: 8px;
  }
`;

export const ConfigContainer = styled.div<{ containerBgColor: string }>`
  padding: 20px;
  background-color: ${(props) => props.containerBgColor};
  color: white;
  border-radius: 10px;
  margin: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

export const Title = styled.h2`
  text-align: center;
`;

export const SectionTitle = styled.h3`
  margin-top: 20px;
  margin-bottom: 10px;
`;

export const Separator = styled.hr<{ borderColor: string }>`
  border: 0;
  height: 1px;
  background: ${(props) => props.borderColor};
  margin: 20px 0;
`;

export const Label = styled.label`
  display: block;
  margin: 10px 0;
`;

export const Input = styled.input<{ inputBgColor: string; borderColor: string }>`
  width: 100%;
  padding: 10px;
  border: 1px solid ${(props) => props.borderColor};
  border-radius: 5px;
  background: ${(props) => props.inputBgColor};
  color: white;
  margin-top: 5px;
`;

export const ColorInput = styled.input`
  width: 50px;
  height: 30px;
  margin-left: 10px;
  border: 2px solid #bbbbbb;
  border-radius: 8px;
  padding: 0;
  cursor: pointer;
  appearance: none;
  background-color: transparent;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 5px;
  }

  &::-moz-color-swatch {
    border: none;
    border-radius: 5px;
  }
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin: 5px 0;
`;

export const CheckboxInput = styled.input`
  margin-right: 10px;
`;

export const CheckboxContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ColorLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
`;

export const ColorLabelText = styled.span`
  flex: 1;
  margin-right: 10px;
`;

// Styled components for the checkbox
export const CheckboxWrapper = styled.div`
  display: flex;
  font-size: 15px;
  align-items: center;
  position: relative;
  .cbx {
    -webkit-user-select: none;
    user-select: none;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 6px;
    overflow: hidden;
    transition: all 0.2s ease;
    display: inline-block;

    &:hover {
      background: rgba(0, 119, 255, 0.06);
    }

    span {
      float: left;
      vertical-align: middle;
      transform: translate3d(0, 0, 0);

      &:first-child {
        position: relative;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        transform: scale(1);
        border: 1px solid #cccfdb;
        transition: all 0.2s ease;
        box-shadow: 0 1px 1px rgba(0, 16, 75, 0.05);

        svg {
          position: absolute;
          top: 3px;
          left: 2px;
          fill: none;
          stroke: #fff;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 16px;
          stroke-dashoffset: 16px;
          transition: all 0.3s ease;
          transition-delay: 0.1s;
          transform: translate3d(0, 0, 0);
        }
      }

      &:last-child {
        padding-left: 8px;
        line-height: 18px;
      }
    }

    &:hover span:first-child {
      border-color: #07f;
    }
  }

  .inp-cbx {
    position: absolute;
    visibility: hidden;

    &:checked + .cbx span:first-child {
      background: #07f;
      border-color: #07f;
      animation: wave-4 0.4s ease;
    }

    &:checked + .cbx span:first-child svg {
      stroke-dashoffset: 0;
    }
  }

  @keyframes wave-4 {
    50% {
      transform: scale(0.9);
    }
  }

  .inline-svg {
    position: absolute;
    width: 0;
    height: 0;
    pointer-events: none;
    user-select: none;
  }
`;

