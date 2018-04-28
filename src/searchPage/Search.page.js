import React, { Component } from 'react';
import styled from 'styled-components';
import qs from 'qs';
import {
    withRouter,
} from 'react-router-dom';
import PlacesAutoComplete from '../components/PlacesAutoComplete';
import initialBounds from '../utils/cityBounds';
import searchIcon from './assets/search.png';
import {searchStateFromQueryString} from '../utils/searchStateFromQueryString';

const searchOptions = {
    bounds: initialBounds,
    strictBounds: true,
    types:['address'],
    componentRestrictions: {country: 'us'}
};

const SearchWrapper = styled.div`
  position: relative;
  margin-top: 50px;
`;

const SubmitButton = styled.button`
    width: 21px;
    height: 21px;
    position: absolute;
    top: 17px;
    right: 50px;
    content: "";
    z-index: 1; 
    background: url(${searchIcon});
    border: 0;
    outline: none;
    cursor: pointer;
`;

const SubmitCTAButton = styled.div`
    width: 100px;
    height: 50px;     
    background-color: darkgreen;
    color: #fff;    
    border: 0;
    outline: none;
    cursor: pointer;
    margin: 16px auto;
    line-height: 50px;
    text-align: center;
    border-radius: 8px;
`;

const updateAfter = 400;

const searchStateToUrl = (path,searchState)=>
    searchState ? `${path}?${qs.stringify(searchState)}` : '';

class SearchPage extends Component {

    constructor(props){
        super(props);
        this.state = {
            searchState: searchStateFromQueryString(props.location.search)
        };
    }

    render(){
        const { searchState: { q} } = this.state;
        return (
            <SearchWrapper>
                <form noValidate role="search" onSubmit={this._onSubmit}>
                    <PlacesAutoComplete
                        initialSearch={q}
                        placeHolder={'Please enter an Address, Neighborhood, City, Zip'}
                        searchOptions={searchOptions}
                        onSelectionChange={this._onSelectionChange} />
                    <SubmitButton type="submit" title="click here to submit" />
                </form>
                <SubmitCTAButton onClick={this._onSubmit}>Submit</SubmitCTAButton>
            </SearchWrapper>
        );
    }

    _onSubmit = (event) => {
        event.preventDefault();
        const {history} = this.props;
        const {searchState} = this.state;
        const href = searchStateToUrl('/crime-trend',searchState);
        history.push(href, href);
    };

    componentWillUnmount(){
        clearTimeout(this.debouncedSetState);
    }

    _onSelectionChange = ({ formatted_address, geometry: { bounds } }) => {
        const {history} = this.props;
        const center = bounds.getCenter();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        const searchState = {
            lat: center.lat(),
            lng: center.lng(),
            ne_lat: ne.lat(),
            ne_lng: ne.lng(),
            sw_lat: sw.lat(),
            sw_lng: sw.lng(),
            q: formatted_address
        };
        clearTimeout(this.debouncedSetState);
        this.debouncedSetState = setTimeout(() => {
            const href = searchStateToUrl(window.location.pathname,searchState);
            history.push(href, href, {
                shallow: true,
            });
        }, updateAfter);
        this.setState({searchState});
    }

}


export default withRouter(SearchPage);
