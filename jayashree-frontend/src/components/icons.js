import {
  TbAward,
  TbRulerMeasure,
  TbBuildingCommunity,
  TbBuildingCottage,
  TbBuildingEstate,
  TbClockCheck,
  TbCrane,
  TbEye,
  TbHeartHandshake,
  TbHome,
  TbHomeCheck,
  TbPlant2,
  TbShieldCheck,
  TbTarget,
  TbUsersGroup,
  TbZoomCheck,
} from 'react-icons/tb';

/** Icons the admin can pick for a service (value stored in the database). */
export const SERVICE_ICONS = {
  home: { label: 'House', Icon: TbHome },
  bungalow: { label: 'Bungalow', Icon: TbBuildingCottage },
  villa: { label: 'Villa', Icon: TbBuildingEstate },
  building: { label: 'Building / project', Icon: TbBuildingCommunity },
  crane: { label: 'Construction crane', Icon: TbCrane },
  blueprint: { label: 'Blueprint', Icon: TbRulerMeasure },
  land: { label: 'Land / plant', Icon: TbPlant2 },
  shield: { label: 'Shield', Icon: TbShieldCheck },
};

export const serviceIcon = (key) => (SERVICE_ICONS[key] || SERVICE_ICONS.home).Icon;

/** "Why choose us" items are matched to icons by position. */
export const WHY_ICONS = [TbAward, TbZoomCheck, TbUsersGroup, TbClockCheck, TbHeartHandshake, TbShieldCheck];

/** Core values on the About page, by position. */
export const VALUE_ICONS = [TbHeartHandshake, TbAward, TbEye, TbUsersGroup, TbShieldCheck, TbHomeCheck];

export const STAT_ICONS = [TbBuildingCommunity, TbAward, TbUsersGroup, TbHeartHandshake];

export { TbEye as VisionIcon, TbTarget as MissionIcon };
