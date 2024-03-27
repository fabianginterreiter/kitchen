// The GraphQL schema
const typeDefs = `#graphql
  type Unit {
    id: ID!
    name: String!
    description: String
  }

  type Ingredient {
    id: ID!
    name: String!
    recipes: [Recipe]
    usages: Int
    category_id: ID
    category: [Category]
  }

  type IngredientsCategory {
    id: ID!
    name: String!
    ingredients: [Ingredient]
  }

  type Tag {
    id: ID!
    name: String!
    recipes: [Recipe]
  }

  enum RecipesOrderType {
    NAME, UPDATED, CREATED
  }

  type Recipe {
    id: ID!
    name: String!
    portions: Int
    source: String
    vegan: Boolean
    vegetarian: Boolean
    description: String
    preparations: [Preparation]
    tags: [Tag]
    tagIds: [Int]
    category: [Category]
    category_id: ID
  }

  type Preparation {
    id: ID!
    step: Int
    title: Boolean
    amount: Float
    unit: Unit
    ingredient: Ingredient
    unit_id: ID
    ingredient_id: ID
    description: String
  }

  type Category {
    id: ID!
    name: String!
    position: Int!
    recipes: [Recipe]
  }

  type Query {
    recipes: [Recipe],
    recipe(id: ID!): Recipe,

    ingredients: [Ingredient],
    ingredient(id: ID!): Ingredient,

    units: [Unit],

    tags: [Tag],
    tag(id: ID!): Tag,

    categories(includeUncategorized: Boolean): [Category],

    ingredientsCategories(includeUncategorized: Boolean): [IngredientsCategory],
  }

  input TagInput {
    id: ID,
    name: String!
  }

  input PreparationInput {
    id: ID
    step: Int!
    title: Boolean
    amount: Float
    unit_id: ID
    ingredient_id: ID
    description: String
  }

  input RecipeInput {
    id: ID
    name: String!
    portions: Int
    source: String
    description: String
    vegan: Boolean
    vegetarian: Boolean
    preparations: [PreparationInput],
    tags: [TagInput]
    category_id: ID
  }

  input UnitInput {
    id: ID,
    name: String!,
    description: String
  }

  input IngredientInput {
    id: ID,
    name: String!
    category_id: ID
  }

  input CategoryInput {
    id: ID,
    name: String!
    position: Int
  }

  input IngredientsCategoryInput {
    id: ID,
    name: String!
  }

  type Mutation {
    createIngredient(ingredient: IngredientInput): Ingredient
    updateIngredient(ingredient: IngredientInput): Ingredient
    deleteIngredient(ingredient: IngredientInput): Boolean

    createRecipe(recipe: RecipeInput): Recipe
    updateRecipe(recipe: RecipeInput): Recipe
    deleteRecipe(recipe: RecipeInput): Boolean

    createUnit(unit: UnitInput): Unit
    updateUnit(unit: UnitInput): Unit
    deleteUnit(unit: UnitInput): Boolean

    createTag(tag: TagInput): Tag
    updateTag(tag: TagInput): Tag
    deleteTag(tag: TagInput): Boolean

    createCategory(category: CategoryInput): Category
    updateCategory(category: CategoryInput): Category
    deleteCategory(category: CategoryInput): Boolean

    createIngredientsCategory(category: IngredientsCategoryInput): IngredientsCategory
    updateIngredientsCategory(category: IngredientsCategoryInput): IngredientsCategory
    deleteIngredientsCategory(category: IngredientsCategoryInput): Boolean
  }
`;

export default typeDefs;