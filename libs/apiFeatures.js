// Define an array of query parameters to be ignored in the filtering process
const ignoreArray = ['limit', 'fields', 'sort', 'page'];

// Define a class for handling API query features
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;

    // Create a copy of the query string
    this.filterQuery = { ...queryString };

    // Remove ignored query parameters from the filterQuery
    ignoreArray.forEach(e => delete this.filterQuery[e]);
  }

  lean(){
    return this.query.lean()
  }
  // Method for filtering the query based on filter parameters
  filter() {
    // Convert the filterQuery to a JSON string
    this.filterQuery = JSON.stringify(this.filterQuery);

    // Define a regular expression pattern for matching query operators
    const regExFinder = /((l|g)te?"|eq"|ne"|n?in")/gi;

    // Replace specific operators with MongoDB operators
    this.filterQuery = JSON.parse(
      this.filterQuery.replace(regExFinder, '$$$1')
    );

    // Loop through the filterQuery and transform filter criteria
    const keys = Object.keys(this.filterQuery);
    keys.forEach(outerKey => {
      const inKeys = Object.entries(this.filterQuery[outerKey]);
      inKeys.forEach(([k, v]) => {
        if (k === 'between' || k === 'nbetween') {
          // Convert 'between' and 'nbetween' to $gte and $lte
          const val = v.split(',');
          delete this.filterQuery[outerKey][k];
          this.filterQuery[outerKey] = {
            $gte: val[0],
            $lte: val[1]
          };
        } else if (
          k === 'startwith' ||
          k === 'endwith' ||
          k === 'contains'
        ) {
          // Create case-insensitive regex for 'startwith', 'endwith', and 'contains'
          delete this.filterQuery[outerKey][k];
          let val = v;
          if (k[0] === 's') val = `^${val}`;
          else if (k[0] === 'e') val = `${val}$`;
          this.filterQuery[outerKey] = new RegExp(val, '');
        } else if (k === '$in' || k === '$nin') {
          // Split and store values for $in and $nin queries
          const val = v.split(',');
          this.filterQuery[outerKey][k] = [...val];
        }
      });
    });

    // Apply the filterQuery to the query object
    this.query = this.query.find(this.filterQuery);
    return this;
  }

  // Method for sorting the query results
  sort() {
    if (!this.queryString.sort) return this;

    // Split and process sorting criteria
    const arrayOfSortingElements = this.queryString.sort.split(',');
    const sortValue = [];
    arrayOfSortingElements.forEach(e => {
      if (!e.match(/:/gi)) {
        sortValue.push(e);
      } else {
        const [v, ar] = e.split(':');
        let sign;
        if (ar.match(/dsc/i)) {
          sign = '-';
        } else {
          sign = '';
        }
        sign = `${sign}${v}`;
        sortValue.push(sign);
      }
    });

    // Apply sorting to the query object
    this.query = this.query.sort(sortValue.join(' '));
    return this;
  }

  // Method for selecting specific fields in the query results
  select() {
    if (!this.queryString.fields) return this;

    // Select the fields specified in the query
    this.query = this.query.select(
      this.queryString.fields.split(',').join(' ')
    );
    return this;
  }

  // Method for paginating the query results
  page() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    // Apply pagination to the query object
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
