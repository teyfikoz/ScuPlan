"""
ScuPlan - Teknik Dalış Hesaplamaları
Teknik dalış için gelişmiş gaz karışımı hesaplamaları
"""

import math
import logging

logger = logging.getLogger(__name__)

# Sabitler
OXYGEN_MOD_DEFAULT = 1.4  # Maksimum pO2 (oksijen parsiyel basıncı) limiti
OXYGEN_CNS_TABLE = {
    # pO2: (dakika başına CNS %'si)
    0.5: 0,
    0.6: 0.14,  # %/dk
    0.7: 0.29,
    0.8: 0.42,
    0.9: 0.57,
    1.0: 0.8,
    1.1: 1.4,
    1.2: 2.2,
    1.3: 3.2,
    1.4: 4.7,
    1.5: 6.8,
    1.6: 9.1,
    1.7: 12.0,
    1.8: 15.0,
    1.9: 19.0 
}

def calculate_partial_pressure(fgas, depth, gas_type="o2"):
    """
    Belirli bir gazın belirtilen derinlikteki parsiyel basıncını hesaplar
    
    Args:
        fgas (float): Gazın kısmi oranı (0.0-1.0)
        depth (float): Derinlik (metre)
        gas_type (str): Gaz tipi ("o2", "n2", "he")
    
    Returns:
        float: Parsiyel basınç (bar)
    """
    # Su basıncı 10m başına 1 bar artar
    # Yüzeyde basınç 1 bar
    absolute_pressure = (depth / 10) + 1
    return fgas * absolute_pressure

def calculate_mod(o2_fraction, max_po2=OXYGEN_MOD_DEFAULT):
    """
    Maksimum Operasyon Derinliğini (MOD) hesaplar
    
    Args:
        o2_fraction (float): Oksijen yüzdesi (0.0-1.0)
        max_po2 (float): Maksimum oksijen parsiyel basıncı limiti (default: 1.4)
    
    Returns:
        float: MOD (metre)
    """
    try:
        if o2_fraction <= 0 or o2_fraction > 1.0:
            raise ValueError("Oksijen yüzdesi 0.0-1.0 arasında olmalıdır")
        
        # MOD = ((PO2 / FO2) - 1) * 10
        mod = ((max_po2 / o2_fraction) - 1) * 10
        return round(mod, 1)
    except Exception as e:
        logger.error(f"MOD hesaplanırken hata: {e}")
        return 0

def calculate_end(depth, o2_fraction, he_fraction=0.0):
    """
    Equivalent Narcotic Depth (END) hesaplama
    
    Args:
        depth (float): Gerçek derinlik (metre)
        o2_fraction (float): Oksijen yüzdesi (0.0-1.0)
        he_fraction (float): Helyum yüzdesi (0.0-1.0)
    
    Returns:
        float: END (metre)
    """
    try:
        # Azot yüzdesi
        n2_fraction = 1.0 - o2_fraction - he_fraction
        
        # Derinlikteki toplam basınç (bar)
        pressure_at_depth = (depth / 10) + 1
        
        # Yüzeydeki azot basıncı
        n2_surface = n2_fraction * 1.0  # 1 bar yüzey basıncı
        
        # Derinlikteki azot basıncı
        n2_at_depth = n2_fraction * pressure_at_depth
        
        # Azot narkoz derinliği
        narcotic_pressure = n2_at_depth
        
        # END'yi hesapla: (narcotic_pressure / n2_surface - 1) * 10
        end = (narcotic_pressure / 0.79 - 1) * 10  # Havadaki N2: 79%
        
        return round(end, 1)
    except Exception as e:
        logger.error(f"END hesaplanırken hata: {e}")
        return depth  # Hata durumunda gerçek derinliği dön

def calculate_best_mix(depth, max_po2=OXYGEN_MOD_DEFAULT, max_end=30.0):
    """
    Belirli bir derinlik için optimal Trimix gaz karışımını hesaplar
    
    Args:
        depth (float): Planlanan derinlik (metre)
        max_po2 (float): Maksimum oksijen parsiyel basıncı (default: 1.4)
        max_end (float): Maksimum END (metre)
    
    Returns:
        dict: Optimal gaz karışımı bilgileri
    """
    try:
        # Derinlikteki toplam basınç
        abs_pressure = (depth / 10) + 1
        
        # Oksijen yüzdesini hesapla (MOD sınırına göre)
        best_o2 = max_po2 / abs_pressure
        best_o2 = min(best_o2, 0.21)  # En az %21 oksijen
        
        # END sınırına göre helyum yüzdesini hesapla
        n2_at_max_end = (((max_end / 10) + 1) * 0.79) / abs_pressure
        best_he = 1.0 - best_o2 - n2_at_max_end
        
        # Değerleri yüzde olarak hesapla ve yuvarla
        o2_percent = round(best_o2 * 100)
        he_percent = round(best_he * 100)
        
        # Azot yüzdesi (kalan)
        n2_percent = 100 - o2_percent - he_percent
        
        # Sonucu döndür
        return {
            "o2_percentage": o2_percent,
            "he_percentage": he_percent,
            "n2_percentage": n2_percent,
            "mix_name": f"Trimix {o2_percent}/{he_percent}"
        }
    except Exception as e:
        logger.error(f"Best mix hesaplanırken hata: {e}")
        return {
            "o2_percentage": 21,
            "he_percentage": 35,
            "n2_percentage": 44,
            "mix_name": "Trimix 21/35"
        }  # Varsayılan değeri döndür

def calculate_cns_loading(po2, exposure_time):
    """
    CNS oksijen toksisitesi yüklemesini hesaplar
    
    Args:
        po2 (float): Oksijen parsiyel basıncı (bar)
        exposure_time (float): Maruziyet süresi (dakika)
    
    Returns:
        float: CNS yüklemesi (%)
    """
    try:
        # pO2 değerine göre yaklaşık CNS oranını belirle
        po2_rounded = round(po2 * 10) / 10  # En yakın 0.1'e yuvarla
        
        # Verilen pO2 tablodan düşükse 0 döndür
        if po2_rounded < 0.5:
            return 0
            
        # Verilen pO2 tablodan yüksekse en yüksek değeri kullan
        if po2_rounded > 1.9:
            po2_rounded = 1.9
            
        # Eğer tam değer yoksa, interpolasyon yap
        if po2_rounded in OXYGEN_CNS_TABLE:
            cns_per_minute = OXYGEN_CNS_TABLE[po2_rounded]
        else:
            # Alt ve üst sınırları bul
            lower_po2 = math.floor(po2_rounded * 10) / 10
            upper_po2 = math.ceil(po2_rounded * 10) / 10
            
            lower_cns = OXYGEN_CNS_TABLE[lower_po2]
            upper_cns = OXYGEN_CNS_TABLE[upper_po2]
            
            # Doğrusal interpolasyon
            cns_per_minute = lower_cns + (po2 - lower_po2) * (upper_cns - lower_cns) / (upper_po2 - lower_po2)
            
        # Toplam CNS yüklemesi
        total_cns = cns_per_minute * exposure_time
        
        return round(total_cns, 1)
    except Exception as e:
        logger.error(f"CNS yüklemesi hesaplanırken hata: {e}")
        return 0

def calculate_multi_level_profile(depth_segments, gases):
    """
    Çoklu seviye ve çoklu gaz dalış profili hesaplar
    
    Args:
        depth_segments (list): Derinlik segmentleri [(depth, time, gas_index), ...]
        gases (list): Gaz karışımları [(o2_percentage, he_percentage), ...]
    
    Returns:
        dict: Hesaplanmış dalış profili
    """
    try:
        profile = {
            "segments": [],
            "total_time": 0,
            "max_depth": 0,
            "max_end": 0,
            "max_po2": 0,
            "max_cns": 0
        }
        
        accumulated_time = 0
        accumulated_cns = 0
        
        for i, segment in enumerate(depth_segments):
            depth, time, gas_index = segment
            
            # Mevcut gazı al
            o2_percent, he_percent = gases[gas_index]
            o2_fraction = o2_percent / 100
            he_fraction = he_percent / 100
            
            # Bu segment için END ve pO2 hesapla
            segment_end = calculate_end(depth, o2_fraction, he_fraction)
            segment_po2 = calculate_partial_pressure(o2_fraction, depth)
            
            # Bu segmentteki CNS yüklemesini hesapla
            segment_cns = calculate_cns_loading(segment_po2, time)
            accumulated_cns += segment_cns
            
            # Zamanı güncelle
            accumulated_time += time
            
            # Segment bilgisini profile ekle
            segment_info = {
                "depth": depth,
                "time": time,
                "gas": {
                    "o2": o2_percent,
                    "he": he_percent,
                    "name": f"{o2_percent}/{he_percent}"
                },
                "end": segment_end,
                "po2": round(segment_po2, 2),
                "cns": segment_cns,
                "accumulated_time": accumulated_time,
                "accumulated_cns": round(accumulated_cns, 1)
            }
            
            profile["segments"].append(segment_info)
            
            # Maksimum değerleri güncelle
            profile["max_depth"] = max(profile["max_depth"], depth)
            profile["max_end"] = max(profile["max_end"], segment_end)
            profile["max_po2"] = max(profile["max_po2"], segment_po2)
            
        # Son değerlerini güncelle
        profile["total_time"] = accumulated_time
        profile["max_cns"] = accumulated_cns
        
        return profile
    except Exception as e:
        logger.error(f"Multi-level profil hesaplanırken hata: {e}")
        return {"error": str(e)}