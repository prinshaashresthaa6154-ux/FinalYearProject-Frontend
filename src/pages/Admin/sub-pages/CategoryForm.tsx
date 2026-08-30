import { ArrowLeft, Image as ImageIcon, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { getApiError } from "../../../api/axios";
import { Button, Input, LoadingSpinner, Textarea } from "../../../components/ui";
import {
  categoryImageUrl,
  categoryService,
  type CategoryInput,
  type CategoryStatus,
} from "../../../services/categoryService";

const emptyForm: CategoryInput = {
  name: "",
  description: "",
  status: "ACTIVE",
};

const allowedImageTypes = ["image/jpeg", "image/png"];
const maxImageSize = 5 * 1024 * 1024;
const normalizeCategoryName = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export default function CategoryForm() {
  const basePath = useLocation().pathname.startsWith("/superadmin") ? "/superadmin" : "/admin";
  const { id } = useParams();
  const categoryId = id ? Number(id) : null;
  const navigate = useNavigate();
  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [loading, setLoading] = useState(Boolean(categoryId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!categoryId) return;
    categoryService
      .adminById(categoryId)
      .then((response) => {
        const category = response.data.data;
        if (category) {
          setForm({
            name: category.name,
            description: category.description ?? "",
            status: category.status,
          });
          setExistingImage(category.image ?? "");
        }
      })
      .catch((requestError) => setError(getApiError(requestError).message))
      .finally(() => setLoading(false));
  }, [categoryId]);

  useEffect(() => {
    if (!imageFile) {
      setFilePreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setFilePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const selectImage = (file: File | null) => {
    setError("");
    if (!file) {
      setImageFile(null);
      return;
    }
    if (!allowedImageTypes.includes(file.type)) {
      setError("Category images must be JPG, JPEG, or PNG files.");
      return;
    }
    if (file.size > maxImageSize) {
      setError("Category images must be 5 MB or smaller.");
      return;
    }
    setImageFile(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload: CategoryInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
    };

    try {
      if (categoryId) {
        await categoryService.update(categoryId, payload, imageFile);
      } else {
        const existingResponse = await categoryService.adminList({
          keyword: payload.name,
          page: 0,
          size: 20,
          sortBy: "name",
          sortDir: "asc",
        });
        const duplicate = existingResponse.data.data?.content.some(
          (category) => normalizeCategoryName(category.name) === normalizeCategoryName(payload.name),
        );
        if (duplicate) {
          setError("A category with this name already exists. Use a unique category name.");
          return;
        }
        await categoryService.create(payload, imageFile);
      }
      navigate(`${basePath}/categories`, { replace: true });
    } catch (requestError) {
      const apiError = getApiError(requestError);
      const fieldErrors = Object.entries(apiError.validationErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(" ");
      setError(fieldErrors || apiError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="grid min-h-64 place-items-center"><LoadingSpinner label="Loading category" /></div>;
  }

  const previewUrl = filePreviewUrl || categoryImageUrl(existingImage);

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`${basePath}/categories`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#8f211c] hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to categories
      </Link>
      <form onSubmit={submit} className="mt-5 overflow-hidden rounded-2xl border border-[#eae3dc] bg-white shadow-sm">
        <div className="border-b border-[#f0eae4] p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#b31919]">{categoryId ? "Edit collection" : "New collection"}</p>
          <h1 className="mt-2 font-display text-3xl font-bold">{categoryId ? "Edit category" : "Create category"}</h1>
          <p className="mt-2 text-sm text-gray-500">Organize destinations and trips into a clear public browsing theme.</p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={100} className="sm:col-span-2" />
          <Textarea label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={1000} rows={6} className="sm:col-span-2" />
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-[#40382f]">Status</span>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as CategoryStatus })} className="min-h-10 w-full rounded-lg border border-[#d8cec0] bg-white px-3 py-2 text-sm">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-sm font-semibold text-[#40382f]">{categoryId ? "Replace image" : "Upload image"} (JPG, JPEG, or PNG)</span>
            <input type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={(event) => selectImage(event.target.files?.[0] ?? null)} className="block min-h-11 w-full rounded-lg border border-[#d8cec0] bg-white px-3 py-2 text-sm" />
            {imageFile && <span className="text-xs text-[#47735b]">Selected: {imageFile.name}</span>}
            {categoryId && !imageFile && existingImage && <span className="text-xs text-gray-500">Choose a new file only to replace the current image.</span>}
          </label>
          <div className="sm:col-span-2">
            <p className="mb-2 text-sm font-semibold text-[#40382f]">Image preview</p>
            {previewUrl ? <img src={previewUrl} alt="Category preview" className="h-52 w-full rounded-xl object-cover" /> : <div className="grid h-52 place-items-center rounded-xl bg-[#f3eee8] text-sm text-gray-500"><ImageIcon className="mr-2 inline h-5 w-5" /> No image selected</div>}
          </div>
        </div>

        {error && <p role="alert" className="mx-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-[#f0eae4] p-6">
          <Link to={`${basePath}/categories`} className="inline-flex min-h-10 items-center rounded-lg border border-[#dfe4e8] px-4 py-2 text-sm font-semibold">Cancel</Link>
          <Button type="submit" loading={saving}><Save className="h-4 w-4" /> {categoryId ? "Save changes" : "Create category"}</Button>
        </div>
      </form>
    </div>
  );
}
