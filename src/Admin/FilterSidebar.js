import React from 'react';
import './FilterSidebar.css'; // Ensure you have the necessary CSS for styling

const getColumnDisplayName = (columnName) => {
  const columnMapping = {
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    phoneNumber: 'מספר טלפון',
    languages: 'שפות',
    city: 'עיר',
    days: 'ימים',
    volunteering: 'התנדבויות',
    email: 'Email',
    date: 'תאריך',
    time: 'שעה',
    comments: 'הערות',
    status: 'סטטוס'
    // Add more mappings as necessary
  };
  return columnMapping[columnName] || columnName;
};

const FilterSidebar = ({ filters, handleFilterChange, filterOptions, showFilters }) => {
  return (
    <div className={`sidebar ${showFilters ? 'open' : 'closed'}`}>
      {showFilters && (
        <div>
          {Object.keys(filterOptions).map((key) => (
            <div key={key} className="filter-group">
              <label>{getColumnDisplayName(key)}:</label>
              {filterOptions[key].map((value) => (
                <div key={value} className="filter-option">
                  <input
                    type="checkbox"
                    value={value}
                    checked={filters[key]?.[value] || false}
                    onChange={(event) => handleFilterChange(event, key)}
                  />
                  {value}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
