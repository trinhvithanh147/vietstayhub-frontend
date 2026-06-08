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
          ? rawProperty?.title || "Ch? ngh? chua x�c d?nh"
          : properties.find((property) => property._id === rawProperty)
              ?.title || "Ch? ngh? chua x�c d?nh";

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
    if (!window.confirm("B?n c� ch?c mu?n x�a d�nh gi� n�y kh�ng?")) return;
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
      alert(err?.response?.data?.message || "?n/hi?n b�nh lu?n th?t b?i");
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
    <div className="rounded-[22px] border border-[#dbe7ff] bg-white p-4 shadow-[0_18px_55px_rgba(0,59,149,0.08)] sm:rounded-[28px] sm:p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#0b2f6a]">��nh gi�</h2>
          <p className="mt-1 text-sm text-[#5b6b86]">
            Danh s�ch d�nh gi� v� b�nh lu?n trong h? th?ng.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <div className="rounded-2xl border border-[#dbe7ff] bg-[#f8fbff] px-4 py-3">
            <div className="text-xs font-semibold text-[#6a7da5]">T?ng</div>
            <div className="text-xl font-bold text-[#0b2f6a]">
              {items.length}
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            className="h-11 rounded-2xl border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
          >
            T?i l?i
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-[#edf3ff] bg-[#f8fbff] p-4 sm:mt-6 sm:rounded-[24px] sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0b2f6a]">
              {editingId ? "C?p nh?t d�nh gi�" : "T?o d�nh gi� m?i"}
            </h3>
            <p className="mt-1 text-sm text-[#5b6b86]">
              Qu?n tr? vi�n c� th? t?o d�nh gi� m?u, c?p nh?t s? sao v� n?i dung
              b�nh lu?n.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="h-11 rounded-2xl bg-[#006ce4] px-4 text-sm font-semibold text-white hover:bg-[#003b95]"
            >
              {editingId ? "C?p nh?t d�nh gi�" : "T?o d�nh gi�"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-11 rounded-2xl border border-[#dbe7ff] bg-white px-4 text-sm font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
            >
              L�m m?i
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
            <option value="">Ch?n ngu?i d�ng</option>
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
            <option value="">Ch?n ch? ngh?</option>
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
          placeholder="Nh?p n?i dung b�nh lu?n"
          className="mt-4 min-h-[120px] w-full rounded-2xl border border-[#dbe7ff] bg-white px-4 py-3 outline-none focus:border-[#006ce4]"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#edf3ff]">
        <div className="flex flex-col gap-3 bg-[#f8fbff] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-semibold text-[#0b2f6a]">
            Danh s�ch d�nh gi�
          </span>
          <button
            type="button"
            onClick={() => setShowReviewList((prev) => !prev)}
            className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
          >
            {showReviewList ? "Thu g?n danh s�ch" : "M? danh s�ch"}
          </button>
        </div>

        {!showReviewList ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Danh s�ch d�nh gi� dang du?c thu g?n.
          </div>
        ) : loading ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">�ang t?i...</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-sm text-[#5b6b86]">
            Kh�ng c� d�nh gi�.
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
                        {group.propertyCity ? " � " : ""}
                        {group.reviews.length} d�nh gi�
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleReviewGroup(group.propertyId)}
                      className="rounded-xl border border-[#dbe7ff] bg-white px-4 py-2 text-xs font-semibold text-[#0b2f6a] hover:bg-[#f6faff]"
                    >
                      {isCollapsed ? "M? d�nh gi�" : "Thu g?n d�nh gi�"}
                    </button>
                  </div>

                  {isCollapsed ? (
                    <div className="px-4 py-6 text-sm text-[#5b6b86]">
                      Nh�m d�nh gi� n�y dang du?c thu g?n.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 p-3 lg:hidden">
                        {group.reviews.map((r) => (
                          <div
                            key={r._id}
                            className="rounded-2xl border border-[#dbe7ff] bg-white p-4 text-sm text-[#0b2f6a]"
                          >
                            <div className="font-semibold">
                              {r.property_id?.title || group.propertyTitle}
                            </div>
                            <div className="mt-1 text-xs text-[#6a7da5]">
                              {r.property_id?.city || group.propertyCity || ""}
                            </div>
                            <div className="mt-3 rounded-2xl bg-[#f8fbff] p-3 text-xs text-[#5b6b86]">
                              <div className="font-semibold text-[#0b2f6a]">
                                {r.user_id?.full_name || "Ngu?i d�ng"}
                              </div>
                              <div className="mt-1 break-words">
                                {r.user_id?.email || ""}
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex rounded-full border border-[#dbe7ff] bg-[#f6faff] px-3 py-1 text-xs font-semibold text-[#0b2f6a]">
                                {r.rating ?? "-"} sao
                              </span>
                              <span
                                className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                                  r.is_visible === false
                                    ? "bg-[#fff3f2] text-[#b42318]"
                                    : "bg-[#e8f7ef] text-[#0f6b3f]"
                                }`}
                              >
                                {r.is_visible === false ? "�ang ?n" : "�ang hi?n"}
                              </span>
                            </div>
                            <div className="mt-3 rounded-2xl border border-[#edf3ff] bg-white px-3 py-3 text-[#5b6b86]">
                              {r.comment || "-"}
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleReviewVisibility(
                                    r._id,
                                    r.is_visible === false,
                                  )
                                }
                                className={`h-10 rounded-xl px-3 text-xs font-semibold transition ${
                                  r.is_visible === false
                                    ? "bg-[#006ce4] text-white hover:bg-[#003b95]"
                                    : "border border-[#f0c6c2] bg-white text-[#b42318] hover:bg-[#fff3f2]"
                                }`}
                              >
                                {r.is_visible === false ? "Hi?n" : "?n"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEdit(r)}
                                className="h-10 rounded-xl bg-[#006ce4] px-3 text-xs font-semibold text-white transition hover:bg-[#003b95]"
                              >
                                S?a
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(r._id)}
                                className="h-10 rounded-xl border border-[#f0c6c2] bg-white px-3 text-xs font-semibold text-[#b42318] transition hover:bg-[#fff3f2]"
                              >
                                X�a
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="hidden overflow-x-auto lg:block">
                        <div className="min-w-[920px]">
                      <div className="grid grid-cols-[1.1fr_0.8fr_0.5fr_1.2fr_0.6fr] gap-3 bg-[#f8fbff] px-4 py-3 text-xs font-semibold tracking-[0.06em] text-[#6a7da5]">
                        <div>Ch? ngh?</div>
                        <div>Ngu?i d�ng</div>
                        <div>S? sao</div>
                        <div>B�nh lu?n</div>
                        <div>Thao t�c</div>
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
                                {r.user_id?.full_name || "Ngu?i d�ng"}
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
                                  ? "�ang ?n"
                                  : "�ang hi?n"}
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
                                  {r.is_visible === false ? "Hi?n" : "?n"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleEdit(r)}
                                  className="rounded-lg bg-[#006ce4] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#003b95]"
                                >
                                  S?a
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(r._id)}
                                  className="rounded-lg border border-[#f0c6c2] bg-white px-3 py-2 text-xs font-semibold text-[#b42318] transition hover:bg-[#fff3f2]"
                                >
                                  X�a
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                        </div>
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
