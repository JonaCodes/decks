export interface IHeroCTAMessage {
  mainText: string;
  subText: string;
  action: string;
}

export interface ILandingFooterCTAMessage extends IHeroCTAMessage {
  headerText: string;
}

export interface ILandingGalleryCTAMessage {
  text: string;
}
