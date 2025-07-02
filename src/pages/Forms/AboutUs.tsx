import { useState, ChangeEvent, FormEvent } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { TimeIcon } from "../../icons";
interface FormData {
  title: string;
  logo: File | null;
  sliderTitle: string;
  mobile: string;
  landline: string;
  email: string;
  timings: string;
  notification: string;
  facebook: string;
  twitter: string;
  instagram: string;
  state: string;
  city: string;
  address: string;
  description: string;
}
interface SelectOption {
  value: string;
  label: string;
}
interface RichTextEditorProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}
const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => (
  <textarea
    value={value}
    onChange={onChange}
    className="w-full h-40 p-3 border border-gray-200 rounded-lg dark:border-gray-800 dark:bg-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
    placeholder="Enter description here..."
  />
);
const AboutUsPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: "MeetOwner",
    logo: null,
    sliderTitle: "We Can Find Just Right Property For You.",
    mobile: "9701888071",
    landline: "9701888071",
    email: "support@meetowner.in",
    timings: "10:00 AM TO 06:00 PM",
    notification: "We are Best in Town With 40 years of Experience.",
    facebook: "Facebook",
    twitter: "Twitter",
    instagram: "Instagram",
    state: "Telangana",
    city: "Hyderabad",
    address:
      "401 8-3-658/54 Astral Hasini Residency J.P. Nagar, Yella Reddy Guda, Hyderabad 500073",
    description:
      "Welcome to Meet Owner, where we believe that finding the perfect property should be a seamless and empowering experience. Founded with a passion for simplifying the real estate journey, Meet Owner is your trusted partner for connecting property seekers directly with owners, eliminating unnecessary barriers and facilitating transparent transactions.\n\n**Our Vision:**\nEmpowering connection, Simplifying Transactions",
  });
  const stateOptions: SelectOption[] = [
    { value: "telangana", label: "Telangana" },
    { value: "andhra-pradesh", label: "Andhra Pradesh" },
    { value: "karnataka", label: "Karnataka" },
  ];
  const cityOptions: SelectOption[] = [
    { value: "hyderabad", label: "Hyderabad" },
    { value: "vijayawada", label: "Vijayawada" },
    { value: "bangalore", label: "Bangalore" },
  ];
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, logo: file }));
  };
  const handleSelectChange = (name: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
      <ComponentCard title="Add/Update About Us">
        <form onSubmit={handleSubmit} className="space-y-6">
          {}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
            />
          </div>
          {}
          <div>
            <Label htmlFor="logo">Logo</Label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="logo"
                name="logo"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 dark:file:bg-gray-800 dark:file:text-gray-300 dark:hover:file:bg-gray-700"
              />
              {formData.logo && (
                <img
                  src={URL.createObjectURL(formData.logo)}
                  alt="Logo Preview"
                  className="h-12 w-12 object-contain"
                />
              )}
            </div>
          </div>
          {}
          <div>
            <Label htmlFor="sliderTitle">Slider Title</Label>
            <Input
              type="text"
              id="sliderTitle"
              name="sliderTitle"
              value={formData.sliderTitle}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
            />
          </div>
          {}
          <div>
            <Label htmlFor="mobile">Mobile</Label>
            <Input
              type="text"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
            />
          </div>
          {}
          <div>
            <Label htmlFor="landline">Landline</Label>
            <Input
              type="text"
              id="landline"
              name="landline"
              value={formData.landline}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
            />
          </div>
          {}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
            />
          </div>
          {}
          <div>
            <Label htmlFor="timings">Timings</Label>
            <div className="relative">
              <Input
                type="text"
                id="timings"
                name="timings"
                value={formData.timings}
                onChange={handleInputChange}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <TimeIcon className="size-6" />
              </span>
            </div>
          </div>
          {}
          <div>
            <Label htmlFor="notification">Notification</Label>
            <Input
              type="text"
              id="notification"
              name="notification"
              value={formData.notification}
              onChange={handleInputChange}
              className="dark:bg-dark-900"
            />
          </div>
          {}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                type="text"
                id="facebook"
                name="facebook"
                value={formData.facebook}
                onChange={handleInputChange}
                className="dark:bg-dark-900"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                type="text"
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                className="dark:bg-dark-900"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                className="dark:bg-dark-900"
              />
            </div>
          </div>
          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">State</Label>
              <Select
                options={stateOptions}
                placeholder="Select a state"
                onChange={handleSelectChange("state")}
                className="dark:bg-dark-900"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Select
                options={cityOptions}
                placeholder="Select a city"
                onChange={handleSelectChange("city")}
                className="dark:bg-dark-900"
              />
            </div>
          </div>
          {}
          <div>
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full h-24 p-3 border border-gray-200 rounded-lg dark:border-gray-800 dark:bg-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Enter address here..."
            />
          </div>
          {}
          <div>
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
          {}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[#1D3A76] text-white rounded-lg hover:bg-brand-600 transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};
export default AboutUsPage;
