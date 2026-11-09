import { mount } from "./legal/mount.tsx";
import { PrivacyPage } from "./legal/privacy-page.tsx";

import "./styles.css";

// oxlint-disable-next-line require-hook -- Mounting the page is the point of this file, not test setup.
mount(<PrivacyPage />);
