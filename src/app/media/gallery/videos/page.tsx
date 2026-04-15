"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Gallery — Videos",
  addButtonLabel: "+ Add Video",
  collectionName: "gallery_videos",
  sortField: "date",
  sortDir: "desc",
  searchFields: ["title", "description"],
  fields: [
    { name: "title",       label: "Title",              type: "text",     required: true,  display: "title",       placeholder: "e.g. Research Workshop 2026 Highlights" },
    { name: "videoUrl",    label: "YouTube Video URL",  type: "url",      required: true,  display: "link",        linkLabel: "▶ Watch on YouTube" },
    { name: "thumbnail",   label: "Thumbnail URL",      type: "url",                       display: "none",        placeholder: "https://img.youtube.com/... or https://imgur.com/..." },
    { name: "album",       label: "Album (optional)",   type: "text",                      display: "badge",       placeholder: "e.g. Research Workshop 2026" },
    { name: "date",        label: "Date",               type: "date",     required: true,  display: "meta" },
    { name: "description", label: "Description",        type: "textarea",                  display: "description", fullWidth: true, placeholder: "What's in this video..." },
  ],
};

export default function VideosPage() {
  return <GenericResourceManager config={config} />;
}
