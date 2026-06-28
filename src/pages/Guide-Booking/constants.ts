import type { Guide } from "../../data/guides";

export const DESTINATIONS_BY_CATEGORY: Record<string, string[]> = {
  Trekking: ["Everest Base Camp", "Annapurna Circuit", "Langtang Valley"],
  Cultural: ["Pashupatinath", "Bhaktapur Durbar", "Patan Heritage"],
  Adventure: ["Paragliding", "White Water Rafting", "Bungee Jump"],
  Religious: ["Lumbini Tour", "Boudhanath", "Swayambhunath"],
  Wildlife: ["Chitwan Safari", "Bird Watching", "Jungle Trek"],
};

export function getDestinationsForGuide(guide: Guide): string[] {
  if (guide.tags.length > 0) {
    return guide.tags;
  }
  return DESTINATIONS_BY_CATEGORY[guide.category] ?? [];
}
