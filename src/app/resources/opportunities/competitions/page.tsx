"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Competitions",
  addButtonLabel: "+ Add Competition",
  collectionName: "opp_competitions",
  sortField: "deadline",
  sortDir: "asc",
  searchFields: ["competitionName", "organizer", "description"],
  fields: [
    { name: "competitionName", label: "Competition Name", type: "text",     required: true,  display: "title",       placeholder: "e.g. NASA Space Apps Challenge 2025" },
    { name: "organizer",       label: "Organizer",        type: "text",     required: true,  display: "badge",       placeholder: "e.g. NASA" },
    { name: "deadline",        label: "Deadline",         type: "date",     required: true,  display: "meta" },
    { name: "prize",           label: "Prize",            type: "text",                      display: "meta",        placeholder: "e.g. $10,000 + Internship (optional)" },
    { name: "applyLink",       label: "Apply Link",       type: "url",      required: true,  display: "link",        linkLabel: "Register Now" },
    { name: "description",     label: "Description",      type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Competition overview, eligibility, and prizes..." },
  ],
};

export default function OpportunityCompetitionsPage() { return <GenericResourceManager config={config} />; }
