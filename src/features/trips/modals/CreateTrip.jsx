import React, { useState, useEffect } from 'react';
import ActionSidebar from '../../../components/navigation/ActionSidebar';
import { useTimeAgo } from '../../../hooks/useTimeAgo';
import { useTeam } from '../../../context/TeamContext';
import { tripsService } from '../services/tripsService';
import { archiveService } from '../../archive/services/archiveServices';
import './CreateTrip.css';

const CATEGORIES = [
    { value: 'Business', label: 'İş Gezisi' },
    { value: 'Vacation', label: 'Tatil'      },
    { value: 'Event',    label: 'Etkinlik'   },
    { value: 'Other',    label: 'Diğer'      },
];

const VEHICLES = [
    { value: 'Plane', label: 'Uçak'    },
    { value: 'Train', label: 'Tren'    },
    { value: 'Car',   label: 'Araba'   },
    { value: 'Bus',   label: 'Otobüs'  },
    { value: 'Ship',  label: 'Gemi'    },
];

const CURRENCIES = [
    { value: 'USD', label: 'USD $' },
    { value: 'EUR', label: 'EUR €' },
    { value: 'TRY', label: 'TRY ₺' },
    { value: 'GBP', label: 'GBP £' },
];

const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-')) return dateStr;
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
};

const EMPTY_FORM = {
    title: '',
    category: 'Business',
    vehicle: 'Plane',
    destination: '',
    startDate: '',
    endDate: '',
    amount: '',
    currency: 'USD',
    desc: '',
};

const CreateTrip = ({ isOpen, onClose, editData, onSuccess, onDelete }) => {
    const isEditMode     = !!editData;
    const { selectedTeamId } = useTeam();
    const timeAgoDisplay = useTimeAgo(editData?.date);

    const [form,        setForm]        = useState(EMPTY_FORM);
    const [isSubmitting,setIsSubmitting]= useState(false);

    useEffect(() => {
        if (!isOpen) return;
        if (isEditMode && editData) {
            setForm({
                title: editData.title || '',
                category: editData.category || 'Business',
                vehicle: editData.vehicle || 'Plane',
                destination: editData.destination || '',
                startDate: formatDateForInput(editData.startDate),
                endDate: formatDateForInput(editData.endDate),
                amount: editData.amount || '',
                currency: editData.currency || 'USD',
                desc: editData.desc || '',
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [isOpen, isEditMode, editData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const now     = new Date();
        const payload = {
            id:          isEditMode ? editData.id : `tr-${Math.floor(Math.random() * 10000)}`,
            teamId:      selectedTeamId,
            title:       form.title,
            category:    form.category,
            vehicle:     form.vehicle,
            destination: form.destination,
            startDate:   form.startDate,
            endDate:     form.endDate,
            amount:      Number(form.amount),
            currency:    form.currency,
            desc:        form.desc,
            status:      isEditMode ? editData.status      : 'Pending',
            statusClass: isEditMode ? editData.statusClass : 'pending',
            date:        isEditMode ? editData.date        : now.toLocaleDateString('tr-TR'),
        };

        try {
            if (isEditMode) {
                await tripsService.updateTrip(editData.id, payload);
            } else {
                await tripsService.createTrip(payload);
            }
 
            archiveService.invalidate();
 
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Gezi işlemi başarısız:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const sidebarTitle = (
        <div className="tr-panel-title">
            <div className="tr-panel-title-icon">
                <i className={`ti ${isEditMode ? 'ti-edit' : 'ti-plane-arrival'}`} />
            </div>
            <div className="tr-panel-title-text">
                <span className="tr-panel-title-name">
                    {isEditMode ? 'Gezi Planını Düzenle' : 'Yeni Gezi Planla'}
                </span>
                <span className="tr-panel-title-sub">
                    {isEditMode
                        ? `Son güncelleme: ${timeAgoDisplay}`
                        : 'Bir rota oluşturmak için detayları doldurun'}
                </span>
            </div>
        </div>
    );

    const sidebarFooter = (
        <div className="tr-panel-footer-alt">
            {isEditMode && onDelete && (
                <button
                    type="button"
                    className="tr-panel-btn delete"
                    onClick={onDelete}
                    disabled={isSubmitting}
                >
                    <i className="ti ti-trash" />
                    Sil
                </button>
            )}
            <button
                type="button"
                className="tr-panel-btn cancel"
                onClick={onClose}
                disabled={isSubmitting}
            >
                <i className="ti ti-x" />
                İptal
            </button>
            <button
                type="submit"
                form="newTripForm"
                className="tr-panel-btn save"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <><i className="ti ti-loader-2 tr-spin" /> Kaydediliyor...</>
                ) : (
                    <><i className={`ti ${isEditMode ? 'ti-device-floppy' : 'ti-check'}`} />
                    {isEditMode ? 'Değişiklikleri Kaydet' : 'Gezi Planı Oluştur'}</>
                )}
            </button>
        </div>
    );

    return (
        <ActionSidebar
            isOpen={isOpen}
            onClose={onClose}
            title={sidebarTitle}
            footer={sidebarFooter}
            width="480px"
        >
            <div className="tr-panel-body-internal">
                <div className="tr-modal-info-bar">
                    <div className="tr-info-item">
                        <i className="ti ti-calendar-event" />
                        <span>{isEditMode ? editData.date : new Date().toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="tr-info-item">
                        <i className="ti ti-shield-check" />
                        <span>{isEditMode ? editData.status : 'Beklemede'}</span>
                    </div>
                </div>

                <form id="newTripForm" className="tr-create-form" onSubmit={handleSubmit}>

                    <div className="tr-section-divider">
                        <span>Genel Bilgiler</span>
                    </div>

                    <div className="tr-input-group">
                        <label>Seyahat Amacı</label>
                        <div className="tr-input-icon-wrap">
                            <i className="ti ti-flag" />
                            <input
                                className="tr-field-input"
                                name="title"
                                type="text"
                                placeholder="İş toplantısı, Berlin konferansı..."
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="tr-input-row">
                        <div className="tr-input-group">
                            <label>Kategori</label>
                            <select
                                className="tr-field-input"
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >
                                {CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="tr-input-group">
                            <label>Araç</label>
                            <select
                                className="tr-field-input"
                                name="vehicle"
                                value={form.vehicle}
                                onChange={handleChange}
                            >
                                {VEHICLES.map((v) => (
                                    <option key={v.value} value={v.value}>{v.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="tr-input-group">
                        <label>Varış Noktası</label>
                        <div className="tr-input-icon-wrap">
                            <i className="ti ti-map-pin" />
                            <input
                                className="tr-field-input"
                                name="destination"
                                type="text"
                                placeholder="Berlin, Almanya"
                                value={form.destination}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="tr-section-divider">
                        <span>Zaman & Bütçe</span>
                    </div>

                    <div className="tr-input-row tr-date-row">
                        <div className="tr-input-group">
                            <label>Başlangıç Tarihi</label>
                            <input
                                className="tr-field-input"
                                name="startDate"
                                type="date"
                                value={form.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="tr-input-group tr-date-row">
                            <label>Bitiş Tarihi</label>
                            <input
                                className="tr-field-input"
                                name="endDate"
                                type="date"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="tr-input-group">
                        <label>Tahmini Gider</label>
                        <div className="tr-amount-wrapper">
                            <input
                                className="tr-amount-input"
                                name="amount"
                                type="number"
                                placeholder="0.00"
                                step="0.01"
                                value={form.amount}
                                onChange={handleChange}
                            />
                            <div className="tr-currency-wrap">
                                <select
                                    className="tr-currency-select"
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleChange}
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                                <i className="ti ti-chevron-down tr-currency-arrow" />
                            </div>
                        </div>
                    </div>

                    <div className="tr-section-divider">
                        <span>Notlar</span>
                    </div>

                    <div className="tr-input-group">
                        <label>Gezi Açıklaması</label>
                        <textarea
                            className="tr-field-input tr-textarea"
                            name="desc"
                            placeholder="Detaylı bilgi, notlar, önemli noktalar..."
                            value={form.desc}
                            onChange={handleChange}
                        />
                    </div>

                </form>
            </div>
        </ActionSidebar>
    );
};

export default CreateTrip;