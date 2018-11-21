import React, { Component } from 'react';
import styled from 'react-emotion';
import Truncate from 'react-truncate';
import { css } from 'emotion';
import { colors } from '../components/ColorDefs';
import MaterialIcon from 'material-icons-react';

// Visually 990 - increased to offset 15px padding on eachside of item block
const ItemShell = styled('div')`
  display: flex;
  justify-content: space-between;
  min-width: 990px;
  margin: 0 15px;
`;
const Item = styled('div')`
  width: 224px;
`;
const ImgShell = styled('div')`
  position: relative;
`;
const Img = styled('div')`
  position: relative;
  width: 224px;
  height: 336px;
  background-color: #333132;
  box-shadow: -1px 7px 34px 5px rgba(0, 0, 0, 0.77);
  > i {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;
const Name = styled('div')`
  font-size: 18px;
  margin: 22px 0 2px;
  max-height: 30px;
`;
const DefInfo = styled('div')`
  font-size: 14px;
  margin: 0 0 0 0;
`;
const noLeftMargin = css`
  margin-left: 0px;
`;
const noRightMargin = css`
  margin-right: 0px;
`;
const RateButton = styled('button')`
  position: absolute;
  z-index: 1;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;
const PlayIcon = styled('button')`
  position: absolute;
  z-index: 2;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export default class ItemsBlock extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    // Remove 15px margin on blocks that are either to far left or far right of strip
    let shellClassName = '';
    if (this.props.itemBlockIndex === 0) {
      shellClassName = noLeftMargin;
    } else if (this.props.itemBlockIndex === this.props.numOfItemBlocks - 1) {
      shellClassName = noRightMargin;
    }

    let fourItems = [];
    if (this.props.items.length > 0) {
      const startIndex =
        this.props.itemBlockIndex * this.props.numItemsToDisplayAtATime;
      const endIndex = startIndex + this.props.numItemsToDisplayAtATime;
      fourItems = this.props.items.slice(startIndex, endIndex);
    }

    return (
      <ItemShell className={shellClassName}>
        {[...Array(this.props.numItemsToDisplayAtATime)].map((x, i) => (
          <Item key={i}>
            {fourItems.length === 4 && (
              <figure>
                <ImgShell>
                  {fourItems[i].image !== '' ? (
                    <Img
                      style={{
                        backgroundImage: 'url(' + fourItems[i].image + ')',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center center',
                        backgroundSize: 'cover',
                      }}
                    />
                  ) : (
                    <Img>
                      <MaterialIcon icon="photo" size={200} color="#3c3c3c" />
                    </Img>
                  )}
                  <RateButton
                    onClick={() => this.props.onItemFavorited(fourItems[i].id)}
                  >
                    <MaterialIcon
                      icon="favorite"
                      size={30}
                      color={colors.white}
                    />
                  </RateButton>
                  {fourItems[i].type === 'artist' && (
                    <PlayIcon>
                      <MaterialIcon
                        icon="play_circle_outline"
                        size={55}
                        color={colors.white}
                      />
                    </PlayIcon>
                  )}
                </ImgShell>
                <figcaption>
                  <Name>
                    <Truncate lines={1} ellipsis={<span>…</span>}>
                      {fourItems[i].name}
                    </Truncate>
                  </Name>
                  <DefInfo>{fourItems[i].definingInfo}</DefInfo>
                </figcaption>
              </figure>
            )}
          </Item>
        ))}
      </ItemShell>
    );
  }
}
