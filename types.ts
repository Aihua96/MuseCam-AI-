export enum AspectRatio {
  NineSixteen = "9:16",
  SixteenNine = "16:9",
  ThreeFour = "3:4",
  OneOne = "1:1",
}

export interface PromptData {
  text: string;
  id: string;
}

export enum RecorderState {
  Idle = "idle",
  Recording = "recording",
  Review = "review", // Post-recording state (optional, for future expansion)
}
