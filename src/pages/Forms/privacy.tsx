import { useState, useRef, useEffect, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { fetchPrivacy, updatePrivacy } from "../../store/slices/legals";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./quillStyles.css";
import React from "react";
interface FormData {
  title: string;
  description: string;
}
const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["blockquote", "code-block"],
      [{ script: "sub" }, { script: "super" }],
      ["clean"],
    ],
    handlers: {
      image: () => {},
    },
  },
};
const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "indent",
  "align",
  "link",
  "image",
  "video",
  "blockquote",
  "code-block",
  "script",
];
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error): { hasError: boolean } {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error in RichTextEditor:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the editor. Please try again.</div>;
    }
    return this.props.children;
  }
}
const RichTextEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const quillRef = useRef<ReactQuill>(null);
  const [height, setHeight] = useState<number>(500);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startY = useRef<number>(0);
  const startHeight = useRef<number>(0);
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const quill = quillRef.current?.getEditor();
          const range = quill?.getSelection(true);
          if (range) {
            quill?.insertEmbed(range.index, "image", base64);
          }
        };
        reader.readAsDataURL(file);
      }
    };
  };
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule("toolbar");
      toolbar.handlers.image = handleImageUpload;
    }
  }, []);
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startY.current = e.clientY;
    startHeight.current = height;
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - startY.current;
    const newHeight = startHeight.current + deltaY;
    if (newHeight >= 150 && newHeight <= 600) {
      setHeight(newHeight);
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);
  return (
    <div className="border border-gray-200 rounded-lg dark:border-gray-800 dark:bg-dark-900">
      <div style={{ height: `${height}px`, overflow: "auto" }}>
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          theme="snow"
          className="dark:bg-dark-900 dark:text-white"
          placeholder="Enter description here..."
          style={{ height: "calc(100% - 40px)" }}
        />
      </div>
      <div
        className="h-2 bg-gray-300 cursor-ns-resize hover:bg-gray-400"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
const PrivacyPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { privacy, loading, error, updateSuccess } =
    useSelector((state: RootState) => state.legals) || {};
  const [formData, setFormData] = useState<FormData>({
    title: "Privacy Policy",
    description: "",
  });

  useEffect(() => {
    dispatch(fetchPrivacy());
  }, [dispatch]);

  useEffect(() => {
    if (privacy) {
      setFormData((prev) => ({ ...prev, description: privacy }));
    }
  }, [privacy]);

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(updatePrivacy(formData.description));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Add/Update Privacy">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="description">Description</Label>
            <ErrorBoundary>
              <div className="prose max-w-none">
                <RichTextEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                />
              </div>
            </ErrorBoundary>
            {loading && (
              <div className="text-xs text-blue-500 mt-2">Loading...</div>
            )}
            {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
            {updateSuccess && (
              <div className="text-xs text-green-600 mt-2">
                Updated successfully!
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};
export default PrivacyPage;
