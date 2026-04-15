"use client";
import GenericResourceManager, { ResourceConfig } from "@/components/resources/GenericResourceManager";

const config: ResourceConfig = {
  pageTitle: "Datasets",
  addButtonLabel: "+ Add Dataset",
  collectionName: "learning_datasets",
  sortField: "name",
  sortDir: "asc",
  searchFields: ["name", "description", "department"],
  fields: [
    { name: "name",         label: "Dataset Name",  type: "text",     required: true,  display: "title",       placeholder: "e.g. HSTU Crop Disease Image Dataset" },
    { name: "department",   label: "Department",    type: "text",     required: true,  display: "badge",       placeholder: "e.g. Dept. of CSE" },
    { name: "format",       label: "Format",        type: "text",     required: true,  display: "meta",        placeholder: "e.g. CSV, JSON, Images (JPEG)" },
    { name: "size",         label: "Size",          type: "text",                      display: "meta",        placeholder: "e.g. 2.3 GB, 10,000 samples" },
    { name: "downloadLink", label: "Download Link", type: "url",      required: true,  display: "link",        linkLabel: "Download Dataset" },
    { name: "description",  label: "Description",   type: "textarea", required: true,  display: "description", fullWidth: true, placeholder: "Dataset contents, collection methodology, and intended use..." },
  ],
};

export default function DatasetsPage() { return <GenericResourceManager config={config} />; }
