// utils/domHelpers.ts
// DOM query utilities for locating Codeforces-specific injection targets.
// Components should call these instead of performing raw DOM queries themselves.

export interface InjectionContainers {
  titleActions?: HTMLElement;
  tagsToggle?: HTMLElement;
  progressSidebar?: HTMLElement;
  friendsSidebox?: HTMLElement;
  modalRoot?: HTMLElement;
  addNoteTab?: HTMLElement;
}

/**
 * Finds the Codeforces DOM nodes needed for injecting our React portals,
 * creates wrapper elements at those locations, and returns them as a map.
 *
 * Injection points:
 *  - titleActions     → appended inside `.problem-statement .title`
 *  - tagsToggle       → appended inside the "Problem tags" roundbox header
 *  - progressSidebar  → prepended to `#sidebar`
 *  - friendsSidebox   → appended to `#sidebar`
 *  - modalRoot        → appended to `document.body`
 *  - addNoteTab       → appended to `.second-level-menu-list`
 *
 * @returns An object containing each created wrapper element (omitted if the
 *          target node was not found on the page).
 */
export function findCodeforcesContainers(): InjectionContainers {
  const containers: InjectionContainers = {};

  // 1. Problem Title Actions → .problem-statement .title
  const titleEl = document.querySelector('.problem-statement .title');
  if (titleEl) {
    const titleContainer = document.createElement('div');
    titleContainer.className = 'problem-actions';
    titleEl.appendChild(titleContainer);
    containers.titleActions = titleContainer;
  }

  // 2. Problem Tags Toggle → div.caption.titled inside the "Problem tags" roundbox
  const roundboxes = Array.from(document.querySelectorAll('div.roundbox'));
  for (const box of roundboxes) {
    const header = box.querySelector('div.caption.titled') as HTMLElement | null;
    if (header && header.textContent?.trim().includes('Problem tags')) {
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      const tagsContainer = document.createElement('span');
      tagsContainer.className = 'problem-tags-toggle';
      header.appendChild(tagsContainer);
      containers.tagsToggle = tagsContainer;
      break;
    }
  }

  // 3. Sidebar Injections → #sidebar
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    // Progress roundbox card inserted below the contest info box (first roundbox) in #sidebar
    const firstRoundbox = sidebar.querySelector('div.roundbox');
    const progressContainer = document.createElement('div');
    progressContainer.className = 'iplus-progress-container';
    progressContainer.style.marginTop = '1em';

    if (firstRoundbox && firstRoundbox.nextSibling) {
      sidebar.insertBefore(progressContainer, firstRoundbox.nextSibling);
    } else if (firstRoundbox) {
      sidebar.appendChild(progressContainer);
    } else {
      sidebar.prepend(progressContainer);
    }

    containers.progressSidebar = progressContainer;

    // Friends' codes box → bottom of sidebar
    const sideboxContainer = document.createElement('div');
    sideboxContainer.className = 'friends-sidebox-container';
    sidebar.appendChild(sideboxContainer);
    containers.friendsSidebox = sideboxContainer;
  }

  // 4. Modal root → document.body
  const modalContainer = document.createElement('div');
  modalContainer.className = 'iplus-modals-root';
  document.body.appendChild(modalContainer);
  containers.modalRoot = modalContainer;

  // 5. Add Note tab → .second-level-menu-list (Codeforces header sub-menu)
  const menuList = document.querySelector('.second-level-menu-list') || document.querySelector('.second-level-menu ul');
  if (menuList) {
    const tabLi = document.createElement('li');
    tabLi.className = 'iplus-add-note-tab';
    menuList.appendChild(tabLi);
    containers.addNoteTab = tabLi;
  }

  return containers;
}

/**
 * Removes all wrapper elements that were created by `findCodeforcesContainers`.
 * Call this in the effect cleanup to leave the Codeforces page clean.
 */
export function removeCodeforcesContainers(containers: InjectionContainers): void {
  containers.titleActions?.remove();
  containers.tagsToggle?.remove();
  containers.progressSidebar?.remove();
  containers.friendsSidebox?.remove();
  containers.modalRoot?.remove();
  containers.addNoteTab?.remove();
}
