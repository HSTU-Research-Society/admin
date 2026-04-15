"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Associate Institutions",
  addButtonLabel: "+ Add Institution",
  collectionName: "partnerships_institutions",
  sortField: "name",
  sortDir: "asc",
  searchFields: ["name", "location", "collaborationArea"],
  fields: [
    { name: "name",              label: "Institution Name",    type: "text",     required: true,  display: "title",       placeholder: "e.g. BUET, IUT, University of Dhaka" },
    { name: "location",          label: "Location",            type: "text",     required: true,  display: "badge",       placeholder: "e.g. Dhaka, Bangladesh" },
    { name: "collaborationArea", label: "Collaboration Area",  type: "text",     required: true,  display: "meta",        placeholder: "e.g. AI Research, Smart Grid" },
    { name: "logo",              label: "Logo URL",            type: "url",                       display: "none",        placeholder: "https://imgur.com/..." },
    { name: "website",           label: "Website",             type: "url",                       display: "link",        linkLabel: "Visit Institution" },
    { name: "description",       label: "Description",         type: "textarea",                  display: "description", fullWidth: true, placeholder: "About the collaboration and what it involves..." },
  ],
};

export default function AssociateInstitutionsPage() {
  return <GenericResourceManager config={config} />;
}
