"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Workshops",
  addButtonLabel: "+ Add Workshop",
  collectionName: "learning_workshops",
  sortField: "date",
  sortDir: "desc",
  searchFields: ["title", "speaker", "description"],
  fields: [
    { name: "title",       label: "Title",            type: "text",     required: true,  display: "title",       placeholder: "e.g. Workshop on Deep Learning Applications" },
    { name: "speaker",     label: "Speaker",          type: "text",     required: true,  display: "meta",        placeholder: "e.g. Dr. Jane Smith" },
    { name: "date",        label: "Date",             type: "date",     required: true,  display: "badge" },
    { name: "slides",      label: "Slides Link",      type: "url",                       display: "link",        linkLabel: "View Slides" },
    { name: "recording",   label: "Recording Link",   type: "url",                       display: "link",        linkLabel: "Watch Recording" },
    { name: "description", label: "Description",      type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Workshop topics, outcomes, and key takeaways..." },
  ],
};

export default function WorkshopsPage() { return <GenericResourceManager config={config} />; }
