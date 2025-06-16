import { SxProps, Theme } from "@mui/material";

interface StylesType {
  wrapper: SxProps<Theme>;
  container: SxProps<Theme>;
  table: SxProps<Theme>;
  checkboxSelection: {
    cell: SxProps<Theme>;
    checkbox: SxProps<Theme>;
  };
  actionToolbar: {
    wrapper: SxProps<Theme>;
    row: SxProps<Theme>;
  };
  tableHead: {
    head: SxProps<Theme>;
    row: SxProps<Theme>;
    cell: SxProps<Theme>;
    typography: SxProps<Theme>;
    checkboxSelection: {
      cell: SxProps<Theme>;
    };
    actionColumn: {
      cell: SxProps<Theme>;
    };
  };
  tableBody: {
    body: SxProps<Theme>;
    row: {
      default: SxProps<Theme>;
      active: SxProps<Theme>;
      disabled: SxProps<Theme>;
    };
    cell: {
      wrapper: SxProps<Theme>;
      container: SxProps<Theme>;
    };
    typography: SxProps<Theme>;
    emptyState: {
      row: SxProps<Theme>;
      cell: SxProps<Theme>;
    };
    loadingState: {
      row: SxProps<Theme>;
      cell: SxProps<Theme>;
    };
    checkboxSelection: {
      cell: SxProps<Theme>;
    };
    actionColumn: {
      cell: SxProps<Theme>;
      icons: {
        left: SxProps<Theme>;
        right: SxProps<Theme>;
      };
    };
  };
  tableFoot: {
    wrapper: SxProps<Theme>;
    pagination: SxProps<Theme>;
    exportBtn: {
      wrapper: SxProps<Theme>;
    };
  };
}

const styles = (theme: Theme): StylesType => ({
  wrapper: {
    width: "100%",
    backgroundColor: theme.palette.grey[100],
    borderRadius: "0.625rem",
    minHeight: "28.1875rem"
  },
  container: {
    maxHeight: "28.1875rem",
    width: "100%",
    borderRadius: "0.625rem",
    outlineOffset: "2px"
  },
  table: {
    background: theme.palette.grey[100]
  },
  checkboxSelection: {
    cell: {
      alignItems: "center",
      justifyContent: "center",
      maxWidth: "4rem",
      padding: "0.5rem 1rem",
      position: "sticky",
      left: 0
    },
    checkbox: {
      color: theme.palette.primary.main,
      cursor: "pointer",
      "&.Mui-checked": {
        color: "primary.main"
      },
      "&.Mui-disabled": {
        cursor: "not-allowed"
      }
    }
  },
  actionToolbar: {
    wrapper: {
      width: "100%",
      gap: "1.25rem"
    },
    row: {
      flexDirection: "row",
      gap: "0.75rem",
      width: "100%",
      height: "min-content",
      spacing: 1,
      alignItems: "center",
      justifyContent: "space-between"
    }
  },
  tableHead: {
    head: {
      width: "100%",
      height: "min-content",
      marginRight: "0rem"
    },
    row: {
      width: "100%",
      height: "3rem",
      gap: "0.5rem"
    },
    cell: {
      textAlign: "left",
      minWidth: "8rem",
      width: "fit-content",
      maxWidth: "15rem",
      padding: "0.5rem 1rem",
      border: "none",
      background: theme.palette.grey[100]
    },
    typography: {
      fontWeight: "400",
      fontSize: "0.875rem",
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      letterSpacing: "0.03em",
      color: theme.palette.text.secondary,
      textTransform: "uppercase"
    },
    checkboxSelection: {
      cell: {
        border: "none",
        width: "6.25rem",
        background: theme.palette.grey[100]
      }
    },
    actionColumn: {
      cell: {
        textAlign: "left",
        width: "8.4375rem",
        minWidth: "8.4375rem",
        padding: "0.5rem 1rem",
        background: theme.palette.grey[100],
        border: "none"
      }
    }
  },
  tableBody: {
    body: { width: "100%" },
    row: {
      default: {
        background: theme.palette.grey[50],
        height: "4.9375rem",
        gap: "0.5rem",
        position: "relative",
        "&:focus-visible": {
          outline: `0.125rem solid ${theme.palette.common.black}`,
          outlineOffset: "-0.125rem",
          zIndex: 1,
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.action.hover,
            opacity: 0.04,
            zIndex: -1
          }
        },
        "&:focus": {
          outline: `0.125rem solid ${theme.palette.common.black}`,
          outlineOffset: "-0.125rem",
          zIndex: 1
        }
      },
      active: {
        transition: "100ms",
        "&:hover": {
          cursor: "pointer",
          background: theme.palette.grey[100]
        }
      },
      disabled: {
        cursor: "not-allowed"
      }
    },
    cell: {
      wrapper: {
        width: "fit-content",
        minWidth: "8rem",
        maxWidth: "15rem",
        padding: "0.5rem 1rem"
      },
      container: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start"
      }
    },
    typography: {},
    checkboxSelection: {
      cell: {
        background: "inherit",
        "&:hover": {
          backgroundColor: "inherit"
        }
      }
    },
    actionColumn: {
      cell: {
        textAlign: "left",
        padding: "0.5rem 1rem",
        width: "8.4375rem",
        minWidth: "8.4375rem"
      },
      icons: {
        left: {
          backgroundColor: theme.palette.grey[100],
          height: "2.25rem",
          p: "0.75rem 1.125rem"
        },
        right: {
          backgroundColor: theme.palette.grey[100],
          height: "2.25rem",
          p: "0.75rem 1.2081rem",
          ml: 0.25
        }
      }
    },
    emptyState: {
      row: {
        height: "24.5rem",
        border: "none"
      },
      cell: {
        border: "none",
        padding: "0rem"
      }
    },
    loadingState: {
      row: {
        height: "24.5rem",
        border: "none"
      },
      cell: {
        padding: "0rem 1rem"
      }
    }
  },
  tableFoot: {
    wrapper: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "auto",
      padding: "1rem"
    },
    pagination: {
      margin: "0rem"
    },
    exportBtn: {
      wrapper: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        spacing: 1,
        marginLeft: "auto"
      }
    }
  }
});

export default styles;
