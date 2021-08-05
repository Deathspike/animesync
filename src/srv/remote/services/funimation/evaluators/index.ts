export type PageStreamExperience = {
  seasons: Array<{
    episodes: Array<{
      languages: Record<string, {
        alpha: Record<string, {
          experienceId: number;
          sources: Array<{
            textTracks: Array<PageStreamExperienceTrack>;
            type: string;
          }>;
        }>
      }>
    }>;
  }>;
};

export type PageStreamExperienceTrack = {
  language: string;
  src: string;
  type: string;
}

export type PageStreamShowExperience = {
  items: Array<{src: string, videoType: string}>
};
