import React, { useEffect, useState, useCallback } from 'react'; 
import Loader from '../../components/common/Loader';
import './expenses.css/Expenses.css';
import SubNavbar from '../../components/navigation/SubNavbar';
import CreateExpense from './modals/CreateExpense';
import ExpenseDetail from './modals/ExpenseDetail';
import CurrencyModal from '../../components/modals/CurrencyModal';
import PaginationFooter from '../../components/common/PaginationFooter';
import ActionSidebar from '../../components/navigation/ActionSidebar'; 
import ExpenseFilter from './modals/ExpenseFilter';
import ExpensesList from './components/ExpensesList'; 

// Servis ve Hook importları
import { expenseService } from './services/expenseService';
import { usePagination } from '../../hooks/usePagination';
import { useFilter } from '../../hooks/useFilter'; 
import { useCurrency } from '../../context/CurrencyContext';

const Expenses = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false); 
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false); 
    
    const { selectedCurrency, updateCurrency } = useCurrency();
    const [activeTeamId, setActiveTeamId] = useState(() => localStorage.getItem('tm_selected_id'));

    const [teamDefaultCurrency, setTeamDefaultCurrency] = useState(() => {
        const nextTeamId = localStorage.getItem('tm_selected_id');
        const rawCache = localStorage.getItem('tm_teams_cache');
        if (rawCache && nextTeamId) {
            const teams = JSON.parse(rawCache);
            const currentTeam = teams.find(t => String(t.id) === String(nextTeamId));
            return currentTeam?.settings?.currency || '';
        }
        return '';
    });

    // Takım Değişikliklerini Senkronize Etme 
    const syncSelectedTeam = useCallback(() => {
        const nextTeamId = localStorage.getItem('tm_selected_id');
        const rawCache = localStorage.getItem('tm_teams_cache');

        if (rawCache && nextTeamId) {
            const teams = JSON.parse(rawCache);
            const currentTeam = teams.find(t => String(t.id) === String(nextTeamId));
            
            if (currentTeam?.settings?.currency) {
                // Sadece state farklıysa güncelleme yap 
                setActiveTeamId(nextTeamId);
                setTeamDefaultCurrency(currentTeam.settings.currency);
                updateCurrency(currentTeam.settings.currency);
            }
        }
    }, [updateCurrency]); 

    // Takım Değişim Event Listener'ı ve İlk Yükleme
    useEffect(() => {
        window.addEventListener('teamChanged', syncSelectedTeam);
        return () => window.removeEventListener('teamChanged', syncSelectedTeam);
    }, [syncSelectedTeam]); // Sadece syncSelectedTeam değişimine bakar
    
    // Sayfalamalı Veri Çekme İşlemi (Custom Hook)
    const { 
        data: expenses, loading, loadingMore, hasMore, loadMore, totalCount, refreshData
    } = usePagination(expenseService.getExpensesByTeam, activeTeamId, 20);

    // Filtreleme ve Arama Mantığı (Custom Hook)
    const {
        searchTerm, setSearchTerm,
        tempFilters, setTempFilters,
        filteredData: filteredExpenses,
        applyFilters, clearFilters
    } = useFilter(
        expenses || [],
        {
            category: '',
            status: '',
            paymentMethod: '',
            minAmount: '',
            maxAmount: ''
        },
        ['title', 'merchant']
    );

    // Gider Silme İşlemi (API Call)
    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Bu gideri silmek istediğinize emin misiniz?")) {
            try {
                await expenseService.deleteExpense(id);
                refreshData(); 
            } catch (err) {
                console.error("Silme hatası:", err);
            }
        }
    };

    // Gider Düzenleme Modu Tetikleyici
    const handleEdit = (e, expense) => {
        e.stopPropagation();
        setSelectedExpense(expense);
        setIsEditMode(true);
        setIsCreateOpen(true);
    };

    // Gider Detaylarını Görüntüleme
    const handleOpenDetail = (expense) => {
        setSelectedExpense(expense);
        setIsDetailOpen(true);
    };

    // Para Birimi Değiştirme Manuel Seçim
    const handleCurrencySelect = (currencyCode) => {
        updateCurrency(currencyCode);
    };

    // Filtreleme Paneli Alt Butonları
    const filterFooter = (
        <div className="as-filter-footer">
            <button className="btn-clear" onClick={clearFilters}>Tümünü Temizle</button>
            <button className="btn-apply" onClick={() => { applyFilters(); setIsFilterOpen(false); }}>Filtreleri Uygula</button>
        </div>
    );

    // İlk Yükleme Esnasında Butterfly Loader Gösterimi
    if (loading) return <Loader type="butterfly" />;

    return (
        <div className="expense-page-container">
            {/* Sayfa Üst Gezinti ve Aksiyon Çubuğu */}
            <SubNavbar 
                pageName="Giderler"
                showCurrency={true}
                searchPlaceholder="Harcama ara..."
                searchValue={searchTerm}
                createLabel="Harcama Oluştur"
                onCreate={() => { 
                    setIsEditMode(false); 
                    setSelectedExpense(null); 
                    setIsCreateOpen(true); 
                }}
                onSearch={(val) => setSearchTerm(val)}
                buttons={[
                    { 
                        icon: 'ti ti-coins', 
                        label: selectedCurrency, 
                        className: 'currency-btn-trigger',
                        onClick: () => setIsCurrencyOpen(true)
                    },
                    { 
                        icon: 'ti ti-filter', 
                        tooltip: 'Filter', 
                        onClick: () => setIsFilterOpen(true) 
                    }
                ]}
            />
            
            <hr className="sub-nav-divider" />

            {/* Gider Tablo ve Liste Alanı */}
            <div className="expense-table-wrapper">
                <div className="expense-title-nav">
                    <input type="checkbox" />
                    <span className="ex-title-span">Detaylar</span>
                    <span className="ex-title-span">Kategori</span>
                    <span className="ex-title-span">İşletme</span>
                    <span className="ex-title-span">Ödeme Yöntemi</span>
                    <span className="ex-title-span">Miktar</span>
                    <span className="ex-title-span">Rapor</span>
                    <span className="ex-title-span">İşlem Durumu</span>
                    <span className="ex-title-span">İşlemler</span>
                </div>

                <div className="expense-list-container">
                    {filteredExpenses.length > 0 ? (
                        <>
                            {/* Harcama Listesi Bileşeni */}
                            <ExpensesList 
                                data={filteredExpenses}
                                onOpenDetail={handleOpenDetail}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />

                            {/* Daha Fazla Yükle ve Sayfalama Bilgisi */}
                            <PaginationFooter 
                                hasMore={hasMore}
                                loadingMore={loadingMore}
                                loadMore={loadMore}
                                currentCount={filteredExpenses.length} 
                                totalCount={totalCount}
                                label="expenses"
                            />
                        </>
                    ) : (
                        <div className="no-data-info">Kriterlerinize uyan hiçbir gider bulunmamaktadır.</div>
                    )}
                </div>
            </div>

            {/* Sağ Panel Filtreleme Modalı */}
            <ActionSidebar 
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title="Filter Expenses"
                width="400px"
                footer={filterFooter}
            >
                <ExpenseFilter filters={tempFilters} setFilters={setTempFilters} />
            </ActionSidebar>

            {/* Yeni Gider Ekleme / Düzenleme Modalı */}
            <CreateExpense 
                isOpen={isCreateOpen} 
                onClose={() => { 
                    setIsCreateOpen(false); 
                    setIsEditMode(false); 
                    setSelectedExpense(null); 
                }} 
                editData={isEditMode ? selectedExpense : null}
                onSuccess={refreshData}
            />

            {/* Gider Detay Görüntüleme Modalı */}
            <ExpenseDetail 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                data={selectedExpense}
                onReopen={() => setIsDetailOpen(true)} 
            />

            {/* Para Birimi Seçim Modalı */}
            <CurrencyModal 
                isOpen={isCurrencyOpen} 
                onClose={() => setIsCurrencyOpen(false)} 
                currentCurrency={selectedCurrency}
                teamDefaultCurrency={teamDefaultCurrency}
                onSelect={handleCurrencySelect}
            />
        </div>
    );
}

export default Expenses;