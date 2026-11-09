import { CookiesPage } from "./legal/cookies-page.tsx";
import { mount } from "./legal/mount.tsx";

import "./styles.css";

// oxlint-disable-next-line require-hook -- Mounting the page is the point of this file, not test setup.
mount(<CookiesPage />);
