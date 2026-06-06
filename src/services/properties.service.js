import { http } from "./config";

const proPertiesService = {
  getAll: () => {
    return http.get("/properties/getAll");
  },
  getCity: (city) => {
    return http.get(`/properties/${city}`);
  },
  getSlug: (slug, city) => {
    return http.get(`/properties/${city}/${slug}`);
  },
  create: (data) => {
    return http.post("/properties/create", data);
  },
  update: (id, data) => {
    return http.put(`/properties/update/${id}`, data);
  },
  delete: (id) => {
    return http.delete(`/properties/delete/${id}`);
  },
  uploadMainImageCloud: (id, file) => {
    const formData = new FormData();
    formData.append("image", file);
    return http.patch(`/properties/upload/cloud/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadGalleryCloud: (id, files = []) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return http.patch(`/properties/upload/gallery/cloud/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
export default proPertiesService;
