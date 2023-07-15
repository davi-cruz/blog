import { graphql, useStaticQuery } from "gatsby";

import { useTextDirection } from "../../../../hooks/useTextDirection";
import { usePageLocale } from "../../../../hooks/usePageLocale";

import { Wrapper, Container, Nav, NavList, CategoryLink } from "./styles";

export const CategoriesMenu = () => {
  const data = useStaticQuery(graphql`
  query MyQuery {
    allMdx {
      nodes {
        frontmatter {
          category
          locale
        }
      }
    }
  }
  `);

  const categoryNodes = [...new Set(data.allMdx.nodes.map(({ frontmatter }) => frontmatter.category))];

  const { pageLocale } = usePageLocale();
  const { isRtl } = useTextDirection();

  return (
    <Wrapper>
      <Container isRtl={isRtl}>
        <Nav>
          <NavList>
            {categoryNodes
              .filter(({ locale }) => locale === pageLocale)
              .map(({ id, title }) => (
                <li key={title}>
                  <CategoryLink recordId={id} activeClassName="activeClassLink">
                    {title}
                  </CategoryLink>
                </li>
              ))}
          </NavList>
        </Nav>
      </Container>
    </Wrapper>
  );
};
