import React, { useEffect, useRef } from 'react';
import { useRoomPresenter } from './useRoomPresenter';
import { CreateRoomView } from '../views/CreateRoomView';
import { MAIN_CUISINES, EXTRA_CUISINES } from '../utils/fixedConsts';

function CreateRoomPresenter({ model }) {
  const { handleCreateRoom, filters, setFilters, previewCode,
    initializeCreateRoomDraft, fetchRoomLocation, roomLocation,
    addressSuggestions, autocompleteAddress, selectAddressSuggestion,
    manualAddressInput, setManualAddressInput } = useRoomPresenter(model);

  const { resetRoom } = model.room;



  const debounceTimer = useRef(null);
  useEffect(() => {
    initializeCreateRoomDraft();
  }, [initializeCreateRoomDraft]);

  const handleAddressType = (text) => {
    setManualAddressInput(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      autocompleteAddress(text);
    }, 500); // Wait 500ms before triggering API call
  };

  const handleAddressSelect = (placeId, text) => {
    setManualAddressInput(text);
    selectAddressSuggestion(placeId);
  };

  const toggleCuisine = (cuisine) => {
    const currentList = filters?.cuisines || [];
    if (currentList.includes(cuisine)) {
      setFilters({ cuisines: currentList.filter(c => c !== cuisine) });
    } else {
      setFilters({ cuisines: [...currentList, cuisine] });
    }
  };

  const togglePriceLevel = (level) => {
    if (level === 0) {
      // "Any" clears all selections
      setFilters({ priceLevels: [] });
      return;
    }
    const current = filters?.priceLevels || [];
    if (current.includes(level)) {
      setFilters({ priceLevels: current.filter(l => l !== level) });
    } else {
      setFilters({ priceLevels: [...current, level] });
    }
  };

  const onPreCreate = () => {
    if (!filters?.roomName || filters.roomName.trim() === '') {
      model.user.setToast("Please enter a Room Name before creating the room.", "error");
      return;
    }
    if (!roomLocation) {
      model.user.setToast("Please set a location before creating the room.", "error");
      return;
    }
    handleCreateRoom(previewCode);
  };

  useEffect(() => {
    return () => {
      resetRoom();
      console.log("Resetting room info");
    };
  }, []);

  return (
    <CreateRoomView
      filters={filters}
      setFilters={setFilters}
      previewCode={previewCode}
      toggleCuisine={toggleCuisine}
      onPreCreate={onPreCreate}
      onFetchLocation={fetchRoomLocation}
      roomLocation={roomLocation}
      addressSuggestions={addressSuggestions}
      handleAddressType={handleAddressType}
      handleAddressSelect={handleAddressSelect}
      addressInput={manualAddressInput}
      mainCuisines={MAIN_CUISINES}
      extraCuisines={EXTRA_CUISINES}
      togglePriceLevel={togglePriceLevel}
    />
  );
}
export default CreateRoomPresenter;