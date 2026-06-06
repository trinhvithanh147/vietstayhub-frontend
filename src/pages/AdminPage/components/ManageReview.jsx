import React, { useEffect, useMemo, useState } from "react";
import { reviewService } from "../../../services/review.service";
import { userService } from "../../../services/users.service";
import proPertiesService from "../../../services/properties.service";

const initialForm = {
  user_id: "",
  property_id: "",
  rating: 5,
  comment: "",
};

const ManageReview = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [showReviewList, setShowReviewList] = useState(true);
  const [collapsedReviewGroups, setCollapsedReviewGroups] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [reviewRes, userRes, propertyRes] = await Promise.all([
        reviewService.getAll(),
        userService.getAll(),
        proPertiesService.getAll(),
      ]);
      setItems(reviewRes?.data?.metaData || []);
      setUsers(userRes?.data?.metaData || []);
      setProperties(propertyRes?.data?.metaData || []);
    } catch (err) {
      console.log(err);
      setItems([]);
      setUsers([]);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const groupedReviews = useMemo(() => {
    return items.reduce((groups, review) => {
      const rawProperty = review.property_id;
      const propertyId =
        typeof rawProperty === "object"
          ? rawProperty?._id || "unknown"
          : rawProperty || "unknown";

      const propertyTitle =
        typeof rawProperty === "object"
          ? rawProperty?.title || "Chỗ nghỉ chưa xác định"
          : properties.find((property) => property._id === rawProperty)
              ?.title || "Chỗ nghỉ chưa xác định";

      const propertyCity =
        typeof rawProperty === "object"
          ? rawProperty?.city || ""
          : properties.find((property) => property._id === rawProperty)?.city ||
            "";

      if (!groups[propertyId]) {
        groups[propertyId] = {
          propertyId,
          propertyTitle,
          propertyCity,
          reviews: [],
        };
      }

      groups[propertyId].reviews.push(review);
      return groups;
    }, {});
  }, [items, properties]);

  const toggleReviewGroup = (propertyId) => {
    setCollapsedReviewGroups((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) return;
    try {
      await reviewService.delete(id);
      await load();
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (review) => {
    setEditingId(review._id);
    setForm({
      user_id:
        typeof review.user_id === "object"
          ? review.user_id?._id || ""
          : review.user_id || "",
      property_id:
        typeof review.property_id === "object"
          ? review.property_id?._id || ""
          : review.property_id || "",
      rating: review.rating || 5,
      comment: review.comment || "",
    });
  };

  const handleReset = () => {
    setEditingId("");
    setForm(initialForm);
  };
  const handleToggleReviewVisibility = async (reviewId, nextVisible) => {
    try {
      await reviewService.visibility(reviewId, nextVisible);

      const res = await reviewService.getAll();
      setItems(res.data.metaData || []);
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Ẩn/hiện bình luận thất bại");
    }
  };
  const handleSubmit = async () => {
    const payload = {
      user_id: form.user_id,
      property_id: form.property_id,
      rating: Number(form.rating) || 5,
      comment: form.comment,
    };

    try {
      if (editingId) {
        await reviewService.update(editingId, {
          rating: payload.rating,
          comment: payload.comment,
        });
      } else {
        await reviewService.create(payload);
      }
      handleReset();
      await load();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="rounded-[28px] border border-[#dbe7ff] bg-white p-6 shadow-[0_18px_55px_rgba(0,59,149,0.08)] md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#0b2f6a]">Đánh giá</h2>
          <p className="mt-1 text-sm text-[#5b6b86]">
            Danh sách đánh giá và bình luận trong hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3">
            <div className="text-xs font-semibold text-[#6a7da5]">Tổng</div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {items.length}
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            className="h-11 rounded-2xl border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
          >
            Tải lại
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-[#edf3ff] bg-[#f8fbff] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0b2f6a]">
              {editingId ? "Cập nhật đánh giá" : "Tạo đánh giá mới"}
            </h3>
            <p className="mt-1 text-sm text-[#5b6b86]">
              Quản trị viên có thể tạo đánh giá mẫu, cập nhật số sao và nội dung
              bình luận.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 rounded-2xl bg-[#006ce4] px-4 text-sm font-semibold text-white hover:bg-[#003b95]"
            >
              {editingId ? "Cập nhật đánh giá" : "Tạo đánh giá"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-11 rounded-2xl border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
            >
              Làm mới
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            <option value="">Chọn người dùng</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.full_name} - {user.email}
              </option>
            ))}
          </select>

          <select
            name="property_id"
            value={form.property_id}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            <option value="">Chọn chỗ nghỉ</option>
            {properties.map((property) => (
              <option key={property._id} value={property._id}>
                {property.title}
              </option>
            ))}
          </select>

          <select
            name="rating"
            value={form.rating}
            onChange={handleChange}
            className="h-12 rounded-2xl border border-[#dbe7ff] bg-white px-4 outline-none focus:border-[#006ce4]"
          >
            <option value={5}>5 sao</option>
            <option value={4}>4 sao</option>
            <option value={3}>3 sao</option>
            <option value={2}>2 sao</option>
            <option value={1}>1 sao</option>
          </select>
        </div>

        <textarea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          placeholder="Nhập nội dung bình luận"
          className="mt-4 min-h-[120px] w-full rounded-2xl border border-[#dbe7ff] bg-white px-4 py-3 outline-none focus:border-[#006ce4]"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#edf3ff]">
        <div className="flex items-center justify-between bg-[#f8fbff] px-4 py-3">
          <span className="text-sm font-semibold text-[#0b2f6a]">
            Danh sách đánh giá
          </span>
          <button
            type="button"
            onClick={() => setShowReviewList((prev) => !prev)}
            className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
          >
            {showReviewList ? "Thu gọn danh sách" : "Mở danh sách"}
          </button>
        </div>

        {!showReviewList ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Danh sách đánh giá đang được thu gọn.
          </div>
        ) : loading ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Không có đánh giá.
          </div>
        ) : (
          <div className="space-y-4 px-4 py-4">
            {Object.values(groupedReviews).map((group) => {
              const isCollapsed = Boolean(
                collapsedReviewGroups[group.propertyId],
              );

              return (
                <div
                  key={group.propertyId}
                  className="overflow-hidden rounded-2xl border border-[#dbe7ff] bg-white"
                >
                  <div className="flex flex-col gap-3 border-b border-[#edf3ff] bg-[#f8fbff] px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#0b2f6a]">
                        {group.propertyTitle}
                      </div>
                      <div className="mt-1 text-xs text-[#6a7da5]">
                        {group.propertyCity || ""}
                        {group.propertyCity ? " • " : ""}
                        {group.reviews.length} đánh giá
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleReviewGroup(group.propertyId)}
                      className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
                    >
                      {isCollapsed ? "Mở đánh giá" : "Thu gọn đánh giá"}
                    </button>
                  </div>

                  {isCollapsed ? (
                    <div className="px-4 py-6 text-sm text-[#5b6b86]">
                      Nhóm đánh giá này đang được thu gọn.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-[1.1fr_0.8fr_0.5fr_1.2fr_0.6fr] gap-3 bg-[#f8fbff] px-4 py-3 text-xs font-semibold tracking-[0.06em] text-[#6a7da5]">
                        <div>Chỗ nghỉ</div>
                        <div>Người dùng</div>
                        <div>Số sao</div>
                        <div>Bình luận</div>
                        <div>Thao tác</div>
                      </div>

                      <div className="divide-y divide-[#edf3ff]">
                        {group.reviews.map((r) => (
                          <div
                            key={r._id}
                            className="grid grid-cols-[1.1fr_0.8fr_0.5fr_1.2fr_0.6fr] gap-3 px-4 py-4 text-sm text-[#0b2f6a]"
                          >
                            <div className="min-w-0">
                              <div className="truncate font-semibold">
                                {r.property_id?.title || group.propertyTitle}
                              </div>
                              <div className="truncate text-xs text-[#6a7da5]">
                                {r.property_id?.city ||
                                  group.propertyCity ||
                                  ""}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <div className="truncate font-semibold">
                                {r.user_id?.full_name || "Người dùng"}
                              </div>
                              <div className="truncate text-xs text-[#6a7da5]">
                                {r.user_id?.email || ""}
                              </div>
                            </div>

                            <div>
                              <span className="inline-flex rounded-full border border-[#dbe7ff] bg-[#f6faff] px-3 py-1 text-xs font-semibold text-[#0b2f6a]">
                                {r.rating ?? "-"}
                              </span>
                            </div>

                            <div className="line-clamp-2 text-[#5b6b86]">
                              {r.comment || "-"}
                            </div>

                            <div className="flex flex-col gap-2">
                              <span
                                className={`w-fit rounded-lg px-3 py-2 text-xs font-semibold ${
                                  r.is_visible === false
                                    ? "bg-[#fff3f2] text-[#b42318]"
                                    : "bg-[#e8f7ef] text-[#0f6b3f]"
                                }`}
                              >
                                {r.is_visible === false
                                  ? "Đang ẩn"
                                  : "Đang hiện"}
                              </span>

                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleReviewVisibility(
                                      r._id,
                                      r.is_visible === false,
                                    )
                                  }
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                    r.is_visible === false
                                      ? "bg-[#006ce4] text-white hover:bg-[#003b95]"
                                      : "border border-[#f0c6c2] bg-white text-[#b42318] hover:bg-[#fff3f2]"
                                  }`}
                                >
                                  {r.is_visible === false ? "Hiện" : "Ẩn"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEdit(r)}
                                  className="rounded-lg bg-[#006ce4] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#003b95]"
                                >
                                  Sửa
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(r._id)}
                                  className="rounded-lg border border-[#f0c6c2] bg-white px-3 py-2 text-xs font-semibold text-[#b42318] transition hover:bg-[#fff3f2]"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReview;
