import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Ergebnisse',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/BirdsResultsView.vue'),
      meta: {
        title: 'Ergebnisse',
        metaTags: [
          {
            name: 'description',
            content: 'Hier ist die Übersichtsseite der Testergebnisse.'
          },
          {
            property: 'og:description',
            content: 'Hier ist die Übersichtsseite der Testergebnisse.'
          }
        ]
      },
    },
    {
      path: '/landing',
      name: 'Lehrerübersicht',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LandingPage.vue'),
      meta: {
        title: 'Übersicht',
        metaTags: [
          {
            name: 'description',
            content: 'Hier ist die Übersichtsseite der Testergebnisse.'
          },
          {
            property: 'og:description',
            content: 'Hier ist die Übersichtsseite der Testergebnisse.'
          }
        ]
      },
    },
    {
      path: '/tabelle',
      name: 'Tabelle',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ResultsTable.vue'),
      meta: {
        title: 'Tabelle',
        metaTags: [
          {
            name: 'description',
            content: 'Hier ist die Übersichtsseite der Testergebnisse.'
          },
          {
            property: 'og:description',
            content: 'Hier ist die Übersichtsseite der Testergebnisse.'
          }
        ]
      },
    },
    {
      path: '/zeugnissaetze',
      name: 'Zeugnissätze',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/ReportCardHelper.vue'),
      meta: {
        title: 'Zeugnissätze',
        metaTags: [
          {
            name: 'description',
            content: 'Hier ist können Zeugnissätze über den Test eingesehen und kopiert werden.'
          },
          {
            property: 'og:description',
            content: 'Hier ist können Zeugnissätze über den Test eingesehen und kopiert werden.'
          }
        ]
      },
    },
    {
      path: '/schuelerin-detail/:code',
      name: 'Ergebnis',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/StudentView.vue'),
      meta: {
        title: 'Dein BKT-Ergebnis',
        metaTags: [
          {
            name: 'description',
            content: 'Hier ist die Übersichtsseite des Ergebnis einer Schülerin.'
          },
          {
            property: 'og:description',
            content: 'Hier ist die Übersichtsseite des Ergebnis einer Schülerin.'
          }
        ]
      },
    },
  ],
})

type TagDef = {
  name?: string,
  property?: string,
  content: string,
}

// This callback runs before every route change, including on page load.
router.beforeEach((to, from, next) => {
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
  // `/nested`'s will be chosen.
  const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);

  // Find the nearest route element with meta tags.
  const nearestWithMeta = to.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);

  const previousNearestWithMeta = from.matched.slice().reverse().find(r => r.meta && r.meta.metaTags);

  // If a route with a title was found, set the document (page) title to that value.
  if (nearestWithTitle) {
    document.title = nearestWithTitle.meta.title as string;
  } else if (previousNearestWithMeta) {
    document.title = previousNearestWithMeta.meta.title as string;
  }

  // Remove any stale meta tags from the document using the key attribute we set below.
  Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(el => el.parentNode?.removeChild(el));

  // Skip rendering meta tags if there are none.
  if (!nearestWithMeta) return next();

  const nearestMetaTags: any = nearestWithMeta.meta.metaTags

  // Turn the meta tag definitions into actual elements in the head.
  nearestMetaTags.map((tagDef: TagDef )=> {
    const tag = document.createElement('meta');

    const tagDefKeys = Object.keys(tagDef) as Array<keyof typeof tagDef>

    tagDefKeys.forEach(key => {
      if (tagDef[key]) {
        tag.setAttribute(key, tagDef[key]);
      }
    });

    // We use this to track which meta tags we create so we don't interfere with other ones.
    tag.setAttribute('data-vue-router-controlled', '');

    return tag;
  })
    // Add the meta tags to the document head.
    .forEach((tag: any) => document.head.appendChild(tag));

  next();
});

export default router
