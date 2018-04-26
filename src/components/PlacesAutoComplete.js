import React from 'react';
import styled from 'styled-components';
import { withState, compose, withHandlers } from 'recompose';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete'

const withAddressState = withState('address', 'setAddress', '');

const withPlaceSearchHandler = withHandlers({
    getGLocationByAddress: ({ onSelectionChange }) => async (address)=> {
        try{
            const results = await geocodeByAddress(address);
            if(results && results.length > 0){
                onSelectionChange(results[0]);
            }
        }catch(e){
            console.error(e);
        }


    }
});

const SearchWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 20px 16px 20px;
  position: relative;
`;

const PlacesAutoComplete = ({ address, setAddress, getGLocationByAddress, searchOptions }) => {
    return (
        <PlacesAutocomplete
            value={address}
            onChange={setAddress}
            onSelect={getGLocationByAddress}
            searchOptions={searchOptions}
        >
            {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                <SearchWrapper >
                    <input
                        {...getInputProps({
                            placeholder: 'Search Places ...',
                            className: 'location-search-input'
                        })}
                    />
                    <div className="autocomplete-dropdown-container">
                        {suggestions.map(suggestion => {
                            const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item';
                            // inline style for demonstration purpose
                            const style = suggestion.active
                                ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                : { backgroundColor: '#ffffff', cursor: 'pointer' };
                            return (
                                <div {...getSuggestionItemProps(suggestion, { className, style })}>
                                    <span>{suggestion.description}</span>
                                </div>
                            )
                        })}
                    </div>
                </SearchWrapper>
            )}
        </PlacesAutocomplete>
    )
};

const enhance = compose(
    withAddressState,
    withPlaceSearchHandler
);

export default enhance(PlacesAutoComplete);
