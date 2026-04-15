"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Conferences",
  addButtonLabel: "+ Add Conference",
  collectionName: "opp_conferences",
  sortField: "eventDate",
  sortDir: "asc",
  searchFields: ["conferenceName", "topicArea", "location"],
  fields: [
    { name: "conferenceName",      label: "Conference Name",       type: "text",  required: true,  display: "title",  placeholder: "e.g. IEEE ICASSP 2025" },
    { name: "topicArea",           label: "Topic Area",            type: "text",  required: true,  display: "badge",  placeholder: "e.g. Signal Processing, AI" },
    { name: "location",            label: "Location",              type: "text",  required: true,  display: "meta",   placeholder: "e.g. Seoul, South Korea / Virtual" },
    { name: "submissionDeadline",  label: "Submission Deadline",   type: "date",  required: true,  display: "meta" },
    { name: "eventDate",           label: "Event Date",            type: "date",  required: true,  display: "meta" },
    { name: "websiteLink",         label: "Website Link",          type: "url",   required: true,  display: "link",   linkLabel: "Visit Website" },
  ],
};

export default function ConferencesPage() { return <GenericResourceManager config={config} />; }
