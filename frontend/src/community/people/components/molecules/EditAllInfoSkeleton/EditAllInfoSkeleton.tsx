import { Grid, Skeleton, Stack } from "@mui/material";

const EditAllInfoSkeleton = () => {
  return (
    <Stack gap={"1.25rem"}>
      <Skeleton
        height="1.875rem"
        width="15.625rem"
        variant="rounded"
        animation="wave"
        sx={{ mb: "1.25rem" }}
      />
      <Grid container spacing={2} sx={{ mb: "2.5rem" }}>
        <Grid item xs={12} md={6} xl={4}>
          <Skeleton
            height="3.125rem"
            width="100%"
            variant="rounded"
            animation="wave"
          />
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Skeleton
            height="3.125rem"
            width="100%"
            variant="rounded"
            animation="wave"
          />
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Skeleton
            height="3.125rem"
            width="100%"
            variant="rounded"
            animation="wave"
          />
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Skeleton
            height="3.125rem"
            width="100%"
            variant="rounded"
            animation="wave"
          />
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Skeleton
            height="3.125rem"
            width="100%"
            variant="rounded"
            animation="wave"
          />
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Skeleton
            height="3.125rem"
            width="100%"
            variant="rounded"
            animation="wave"
          />
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Skeleton
            height="3.125rem"
            width="100%"
            variant="rounded"
            animation="wave"
          />
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Skeleton
            height="3.125rem"
            width="100%"
            variant="rounded"
            animation="wave"
          />
        </Grid>

        <Grid item xs={12} md={6} xl={4}>
          <Skeleton
            height="3.125rem"
            width="100%"
            variant="rounded"
            animation="wave"
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default EditAllInfoSkeleton;
