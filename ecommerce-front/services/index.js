import { request, gql } from 'graphql-request';

const graphqlAPI = process.env.NEXT_PUBLIC_GRAPHCMS_ENDPOINT;

export const getPosts = async () => {
  const query = gql`
    query MyQuery {
        postsConnection(orderBy: createdAt_DESC) {
          edges {
            node {
              featuredImage {
                url
              }
              categories {
                name
                slug
              }
              subcategories {
                name
                slug
              }
              slug
              title
              author {
                name
                slug
              }
              excerpt
              createdAt
              updatedAt
            }
          }
        }
      }
    `

  const result = await request(graphqlAPI, query);
  return result.postsConnection.edges;
}

export const getRecentPosts = async () => {
  const query = gql`
  query GetPostDetails(){
    posts(
      orderBy:createdAt_DESC
      first:5
    ){
      title
      featuredImage {
        url
      }
      slug
    }
  }
  `

  const result = await request(graphqlAPI, query);
  return result.posts;
}

export const getSimilarPosts = async (slug, categories, subcategories) => {
  
  const query = gql`
  query getSimilarPosts($slug:String!,$categories:[String!],$subcategories:[String!]){
    posts(
      where: {slug_not:$slug, AND: {categories_some: {slug_in: $categories}, subcategories_some: {slug_in: $subcategories}}}
      orderBy:createdAt_DESC
      last:5
    ) {
      title
      slug
      featuredImage {
        url
      }
    }
  }
  `;
  const result = await request(graphqlAPI, query,{slug,categories,subcategories});
  return result.posts;
}
export const getSimilarCategoryPosts = async (slug) => {
  
  const query = gql`
  query getSimilarPosts($slug:String!){
    posts(
      where: {categories_some: {slug: $slug}}
      orderBy:createdAt_DESC
      last:5
    ) {
      title
      slug
      featuredImage {
        url
      }
    }
  }
  `;
  const result = await request(graphqlAPI, query,{slug});
  return result.posts;
}
export const getPostDetails = async (slug) => {
  
  const query = gql`
    query GetPostDetails($slug : String!) {
      post(where: {slug: $slug}) {
        id
        title
        categories {
          name
          slug
        }
        excerpt
        subcategories {
          name
          slug
        }
        tags
        slug
        featuredImage {
          url
        }
        featuredPost
        videoPost
        createdAt
        author {
          name
          slug
        }
        content {
          raw
          text
          references {
            ... on Product {
              id
              name
              photo {
                url
              }
              market
              price
              usage
              url
            }
          }
        }
      }
    }
  `;

  const result = await request(graphqlAPI, query, { slug });

  return result.post;
};
export const getCategoryPosts = async (slug) => {
  
  const query = gql`
  query MyQuery($slug:String!) {
    posts(
      where: {categories_some: {slug: $slug}}
      orderBy: createdAt_DESC
    ) {
      featuredImage {
        url
      }
      categories {
        name
        slug
      }
      subcategories {
        name
        slug
      }
      slug
      title
      author {
        name
        slug
      }
      excerpt
      createdAt
    }
  }
  `;

  const result = await request(graphqlAPI, query, { slug });

  return result.posts;
};

export const getCategories = async () => {
  
  const query = gql`
  query MyQuery {
    categoriesConnection {
      edges {
        node {
          slug
          createdAt
          updatedAt
        }
      }
    }
  }
  `;

  const result = await request(graphqlAPI, query);

  return result.categoriesConnection.edges;
};

export const getCategory = async (slug) => {
  
  const query = gql`
  query MyQuery($slug:String!) {
    category(where: {slug: $slug}) {
      name
      slug
      photo {
        url
      }
    }
  }
  `;

  const result = await request(graphqlAPI, query,{slug});

  return result.category;
};





export const getSubcategoryPosts = async (slug) => {
  
  const query = gql`
  query MyQuery($slug:String!) {
    posts(
      where: {subcategories_some: {slug: $slug}}
      orderBy: createdAt_DESC
    ) {
      featuredImage {
        url
      }
      categories {
        name
        slug
      }
      subcategories {
        name
        slug
      }
      slug
      title
      author {
        name
        slug
      }
      excerpt
      createdAt
    }
  }
  `;

  const result = await request(graphqlAPI, query, { slug });

  return result.posts;
};

export const getSubcategory = async (slug) => {
  
  const query = gql`
  query MyQuery($slug:String!) {
    subcategory(where: {slug: $slug}) {
      name
      slug
      photo {
        url
      }
    }
  }
  `;

  const result = await request(graphqlAPI, query,{slug});

  return result.subcategory;
};

export const getSubcategories = async () => {
  
  const query = gql`
  query MyQuery {
    subcategoriesConnection {
      edges {
        node {
          slug
          category {
            slug
          }
          updatedAt
          createdAt
        }
      }
    }
  }
  `;

  const result = await request(graphqlAPI, query);

  return result.subcategoriesConnection.edges;
};

export const getSimilarSubcategoryPosts = async (slug) => {
  
  const query = gql`
  query getSimilarPosts($slug:String!){
    posts(
      where: {subcategories_some: {slug: $slug}}
      orderBy:createdAt_DESC
      last:5
    ) {
      title
      slug
      featuredImage {
        url
      }
    }
  }
  `;
  const result = await request(graphqlAPI, query,{slug});
  return result.posts;
}