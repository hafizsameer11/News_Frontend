"use client";

import { useRef, useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { MediaLibraryModal } from "./media-library-modal";
import { Media } from "@/types/media.types";
import { getImageUrl } from "@/lib/helpers/imageUrl";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  disabled = false,
}: RichTextEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<{ insertContent: (content: string) => void } | null>(null);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const handleMediaSelect = (media: Media) => {
    if (editorRef.current && media.type === "IMAGE") {
      const imageUrl = getImageUrl(media.url);
      editorRef.current.insertContent(
        `<img src="${imageUrl}" alt="${media.caption || ""}" />`
      );
    }
    setIsMediaLibraryOpen(false);
  };

  // Custom button for media library
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setupCustomButton = (editor: any) => {
    editor.ui.registry.addButton("medialibrary", {
      text: "Insert Media",
      tooltip: "Insert image from media library",
      onAction: () => {
        setIsMediaLibraryOpen(true);
      },
    });
  };

  // Get API key - if not set, TinyMCE will use GPL license (self-hosted)
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY?.trim();

  return (
    <>
      <Editor
        {...(apiKey ? { apiKey } : {})}
        onInit={(evt, editor) => {
          editorRef.current = editor;
          setupCustomButton(editor);
        }}
        value={value}
        onEditorChange={onChange}
        disabled={disabled}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | link image medialibrary | code fullscreen | help",
          placeholder,
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          image_advtab: true,
          image_title: true,
          automatic_uploads: false,
          file_picker_types: "image",
          // Use GPL license if no API key (self-hosted mode)
          license_key: apiKey ? undefined : "gpl",
          // Custom image picker that opens media library
          file_picker_callback: (callback: any, value: any, meta: any) => {
            if (meta.filetype === "image") {
              setIsMediaLibraryOpen(true);
              // Store callback to insert image after selection
              (window as any).tinymceImageCallback = callback;
            }
          },
        }}
      />

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelect={(media) => {
          handleMediaSelect(media);
          // If there's a pending callback from file picker, use it
          if ((window as any).tinymceImageCallback && media.type === "IMAGE") {
            const imageUrl = getImageUrl(media.url);
            (window as any).tinymceImageCallback(imageUrl, {
              alt: media.caption || "",
              title: media.caption || "",
            });
            delete (window as any).tinymceImageCallback;
          }
        }}
        filterType="IMAGE"
        title="Select Image"
      />
    </>
  );
}
